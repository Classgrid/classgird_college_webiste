export type TenantThemeColors = {
  primary?: string;
  secondary?: string;
  primaryDark?: string;
  accent?: string;
  surface?: string;
  darkSurface?: string;
};

type ThemeRecord = Record<string, unknown>;

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function isRecord(value: unknown): value is ThemeRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function firstRecord(...values: unknown[]) {
  for (const value of values) {
    if (isRecord(value)) return value;
  }
  return {};
}

export function normalizeHexColor(value: unknown) {
  const color = firstString(value);
  return HEX_COLOR_PATTERN.test(color) ? color : "";
}

export function normalizeThemeColors(source: unknown): TenantThemeColors {
  const root = firstRecord(source);
  const colors = firstRecord(root.theme_colors, root.themeColors, root.colors, root);
  const primary = normalizeHexColor(colors.primary || colors.primaryColor);
  const secondary = normalizeHexColor(
    colors.secondary ||
      colors.secondaryColor ||
      colors.primaryDark ||
      colors.primary_dark
  );
  const accent = normalizeHexColor(colors.accent || colors.accentColor);
  const surface = normalizeHexColor(colors.surface);
  const darkSurface = normalizeHexColor(colors.darkSurface || colors.dark_surface);

  return {
    primary,
    secondary,
    primaryDark: secondary,
    accent,
    surface,
    darkSurface,
  };
}
