"""Tiny, safe expression evaluator for device-profile templates.

Template values are either literals or strings of the form ``"{{ expr }}"``.
Expressions support arithmetic, comparisons, boolean ops, conditional
expressions, bitwise ops, and a few whitelisted functions.
"""

from __future__ import annotations

import ast
import operator
import re
from typing import Any

_TEMPLATE = re.compile(r"^\s*\{\{(.*)\}\}\s*$", re.S)

_BIN = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: lambda a, b: _bounded_pow(a, b),
    ast.BitAnd: operator.and_,
    ast.BitOr: operator.or_,
    ast.BitXor: operator.xor,
    ast.LShift: operator.lshift,
    ast.RShift: operator.rshift,
}
def _bounded_pow(a: Any, b: Any) -> Any:
    """Exponentiation, refusing huge results (a template must not hang the emulator)."""
    if abs(b) > 64 or (isinstance(a, int) and abs(a) > 2**32 and b > 2):
        raise ValueError("exponent too large")
    return operator.pow(a, b)


_UNARY = {ast.USub: operator.neg, ast.UAdd: operator.pos, ast.Not: operator.not_, ast.Invert: operator.invert}
_CMP = {
    ast.Eq: operator.eq,
    ast.NotEq: operator.ne,
    ast.Lt: operator.lt,
    ast.LtE: operator.le,
    ast.Gt: operator.gt,
    ast.GtE: operator.ge,
    ast.In: lambda a, b: a in b,
    ast.NotIn: lambda a, b: a not in b,
}
_FUNCS = {
    "abs": abs, "min": min, "max": max, "round": round, "int": int, "float": float, "str": str,
    # byte-order helpers for firmware that puts big-endian numbers in LE attributes
    "bswap16": lambda v: int.from_bytes(int(v).to_bytes(2, "little"), "big"),
    "bswap32": lambda v: int.from_bytes(int(v).to_bytes(4, "little"), "big"),
    # element i of a ZCL uint8 array attribute (hex: elementType, count u16, elements)
    "arr": lambda hexval, i: bytes.fromhex(hexval)[3 + int(i)],
}  # fmt: skip


def _eval(node: ast.AST, env: dict[str, Any]) -> Any:
    if isinstance(node, ast.Expression):
        return _eval(node.body, env)
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, ast.Name):
        if node.id in env:
            return env[node.id]
        raise NameError(f"unknown variable {node.id!r}")
    if isinstance(node, ast.BinOp) and type(node.op) in _BIN:
        return _BIN[type(node.op)](_eval(node.left, env), _eval(node.right, env))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY:
        return _UNARY[type(node.op)](_eval(node.operand, env))
    if isinstance(node, ast.BoolOp):
        vals = [_eval(v, env) for v in node.values]
        return all(vals) if isinstance(node.op, ast.And) else any(vals)
    if isinstance(node, ast.Compare):
        left = _eval(node.left, env)
        for op, comp in zip(node.ops, node.comparators):
            right = _eval(comp, env)
            if type(op) not in _CMP or not _CMP[type(op)](left, right):
                return False
            left = right
        return True
    if isinstance(node, ast.Subscript) and not isinstance(node.slice, ast.Slice):
        return _eval(node.value, env)[_eval(node.slice, env)]
    if isinstance(node, (ast.Tuple, ast.List)):
        return tuple(_eval(e, env) for e in node.elts)
    if isinstance(node, ast.IfExp):
        return _eval(node.body, env) if _eval(node.test, env) else _eval(node.orelse, env)
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
        fn = _FUNCS.get(node.func.id) or (env.get(node.func.id) if callable(env.get(node.func.id)) else None)
        if fn is not None and not node.keywords:
            return fn(*[_eval(a, env) for a in node.args])
    raise ValueError(f"unsupported expression: {ast.dump(node)}")


_INLINE = re.compile(r"\{\{(.*?)\}\}", re.S)


def evaluate(expr: str, env: dict[str, Any]) -> Any:
    return _eval(ast.parse(expr.strip(), mode="eval"), env)


def render(value: Any, env: dict[str, Any]) -> Any:
    """Render a template value (recursively for lists/dicts)."""
    if isinstance(value, str):
        m = _TEMPLATE.match(value)
        if m and "{{" not in m.group(1):
            return evaluate(m.group(1), env)
        return _INLINE.sub(lambda im: str(evaluate(im.group(1), env)), value)
    if isinstance(value, list):
        return [render(v, env) for v in value]
    if isinstance(value, dict):
        return {k: render(v, env) for k, v in value.items()}
    return value
