// Normalize a display name into a valid Homex id (matches backend ^[a-z0-9_]+$).
const ACCENTS = /[̀-ͯ]/g;

export const slugify = (value: string): string =>
  (value || "")
    .normalize("NFD")
    .replace(ACCENTS, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
