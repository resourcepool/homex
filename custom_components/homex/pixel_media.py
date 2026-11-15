"""Media of "Animated pixel" dynamic scenes: the source videos and the frames
sampled from them.

The browser does the video work: it samples the video at the chosen interval
and averages each light's zone into one colour per sample. Home Assistant only
stores:

  * the video (``<config>/homex/pixel/<id>.<ext>``), so the zones can be
    edited later — uploaded / downloaded through two authenticated HTTP views;
  * the sampled frames (``<config>/homex/pixel/<id>.frames.json``):
    ``{entity_id: [[r, g, b, brightness 0-255], …]}``, one entry per sample.

Files no scene references any more are removed when the hub starts (after an
hour, so a video just uploaded for a scene being created is left alone).
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
import uuid

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

MEDIA_DIR = os.path.join("homex", "pixel")
MAX_VIDEO_BYTES = 200 * 1024 * 1024
MAX_FRAMES = 6000  # = the panel's MAX_SAMPLES
VIDEO_TYPES = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/ogg": "ogv",
}
_ID = re.compile(r"^[0-9a-f]{32}$")
_STALE_S = 3600


def media_dir(hass: HomeAssistant) -> str:
    return hass.config.path(MEDIA_DIR)


def _video_path(hass: HomeAssistant, video_id: str) -> str | None:
    if not _ID.match(video_id or ""):
        return None
    folder = media_dir(hass)
    for ext in VIDEO_TYPES.values():
        path = os.path.join(folder, f"{video_id}.{ext}")
        if os.path.isfile(path):
            return path
    return None


def _frames_path(hass: HomeAssistant, frames_id: str) -> str | None:
    if not _ID.match(frames_id or ""):
        return None
    return os.path.join(media_dir(hass), f"{frames_id}.frames.json")


# ---- frames ------------------------------------------------------------------


def clean_frames(raw) -> dict[str, list[list[int]]]:
    """Validate sampled frames: {light: [[r, g, b, bri], …]} (all same length)."""
    if not isinstance(raw, dict):
        return {}
    out: dict[str, list[list[int]]] = {}
    for entity_id, samples in raw.items():
        if not (isinstance(entity_id, str) and entity_id.startswith("light.")):
            continue
        if not isinstance(samples, list):
            continue
        clean = []
        for sample in samples[:MAX_FRAMES]:
            if not (isinstance(sample, (list, tuple)) and len(sample) == 4):
                break
            try:
                clean.append([max(0, min(255, int(v))) for v in sample])
            except (TypeError, ValueError):
                break
        if clean:
            out[entity_id] = clean
    if not out:
        return {}
    count = min(len(v) for v in out.values())
    return {k: v[:count] for k, v in out.items()}


async def async_save_frames(hass: HomeAssistant, frames: dict) -> str:
    """Store sampled frames; returns their id."""
    frames_id = uuid.uuid4().hex

    def write() -> None:
        os.makedirs(media_dir(hass), exist_ok=True)
        with open(_frames_path(hass, frames_id), "w", encoding="utf-8") as fh:
            json.dump(frames, fh, separators=(",", ":"))

    await hass.async_add_executor_job(write)
    return frames_id


def load_frames(hass: HomeAssistant, frames_id: str) -> dict:
    """Read stored frames (executor). {} when missing or unreadable."""
    path = _frames_path(hass, frames_id)
    if not path or not os.path.isfile(path):
        return {}
    try:
        with open(path, encoding="utf-8") as fh:
            return clean_frames(json.load(fh))
    except (OSError, ValueError):
        _LOGGER.warning("Homex: unreadable pixel frames %s", path)
        return {}


# ---- clean-up ------------------------------------------------------------------


def cleanup_unreferenced(hass: HomeAssistant, keep: set[str]) -> int:
    """Remove media files whose id isn't in ``keep`` and older than an hour
    (executor). Returns the number of files removed."""
    folder = media_dir(hass)
    if not os.path.isdir(folder):
        return 0
    removed = 0
    now = time.time()
    for name in os.listdir(folder):
        file_id = name.split(".", 1)[0]
        if not _ID.match(file_id) or file_id in keep:
            continue
        path = os.path.join(folder, name)
        try:
            if now - os.path.getmtime(path) < _STALE_S:
                continue
            os.remove(path)
            removed += 1
        except OSError:
            continue
    return removed


# ---- HTTP views ------------------------------------------------------------------


class PixelUploadView(HomeAssistantView):
    """POST /api/homex/pixel/video (multipart, field ``file``) → {video_id}."""

    url = "/api/homex/pixel/video"
    name = "api:homex:pixel:upload"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        user = request.get("hass_user")
        if user is None or not user.is_admin:
            return self.json_message("Admin only", status_code=403)
        try:
            reader = await request.multipart()
            field = await reader.next()
            while field is not None and getattr(field, "name", None) != "file":
                field = await reader.next()
        except Exception:  # noqa: BLE001 - malformed body
            return self.json_message("Invalid upload", status_code=400)
        if field is None:
            return self.json_message("No file", status_code=400)
        ext = VIDEO_TYPES.get((field.headers.get("Content-Type") or "").split(";")[0].strip())
        if ext is None:
            return self.json_message("Unsupported video type", status_code=415)

        video_id = uuid.uuid4().hex
        folder = media_dir(hass)
        path = os.path.join(folder, f"{video_id}.{ext}")
        await hass.async_add_executor_job(lambda: os.makedirs(folder, exist_ok=True))
        fh = await hass.async_add_executor_job(open, path, "wb")
        size = 0
        try:
            while chunk := await field.read_chunk(1024 * 1024):
                size += len(chunk)
                if size > MAX_VIDEO_BYTES:
                    raise ValueError("too big")
                await hass.async_add_executor_job(fh.write, chunk)
        except ValueError:
            await hass.async_add_executor_job(fh.close)
            await hass.async_add_executor_job(os.remove, path)
            return self.json_message("Video too large", status_code=413)
        finally:
            if not fh.closed:
                await hass.async_add_executor_job(fh.close)
        return self.json({"video_id": video_id, "size": size})


class PixelVideoView(HomeAssistantView):
    """GET /api/homex/pixel/video/{video_id} → the stored video."""

    url = "/api/homex/pixel/video/{video_id}"
    name = "api:homex:pixel:video"
    requires_auth = True

    async def get(self, request: web.Request, video_id: str) -> web.StreamResponse:
        hass: HomeAssistant = request.app["hass"]
        path = await hass.async_add_executor_job(_video_path, hass, video_id)
        if path is None:
            return self.json_message("Not found", status_code=404)
        return web.FileResponse(path)


def register_views(hass: HomeAssistant) -> None:
    hass.http.register_view(PixelUploadView())
    hass.http.register_view(PixelVideoView())
