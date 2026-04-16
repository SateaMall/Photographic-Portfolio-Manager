export const DEFAULT_PRIMARY_COLOR = "#111827";
export const DEFAULT_SECONDARY_COLOR = "#e9ff3f";

export function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim());
}

export function colorInputValue(value: string, fallback: string) {
  const normalized = value.trim();
  return isHexColor(normalized) && normalized.length === 7 ? normalized : fallback;
}
