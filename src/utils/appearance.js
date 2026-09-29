export const APPEARANCE_DEFAULTS = {
  wallpaperBlur: 5,
  panelBlur: 26,
  sectionBlur: 22,
  chromeBlur: 30,
  highContrast: false,
  reducedMotion: false,
};

export function normalizeAppearance(value) {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(Object.entries(APPEARANCE_DEFAULTS).map(([key, fallback]) => {
    const candidate = source[key];
    if (typeof fallback === "boolean") {
      return [key, typeof candidate === "boolean" ? candidate : fallback];
    }
    return [key, typeof candidate === "number" && Number.isFinite(candidate)
      ? Math.round(Math.min(40, Math.max(0, candidate))) : fallback];
  }));
}
