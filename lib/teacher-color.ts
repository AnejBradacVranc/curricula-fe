const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value);
}

function expandHex(hex: string): string {
  if (hex.length === 3) {
    return hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  return hex;
}

export function hasTeacherColor(
  color: string | null | undefined,
): color is string {
  return Boolean(color && isHexColor(color));
}

export function teacherColorWithOpacity(
  color: string,
  opacity = 0.5,
  fallback = "var(--primary)",
): string {
  if (!isHexColor(color)) {
    return `color-mix(in srgb, ${fallback} ${Math.round(opacity * 100)}%, transparent)`;
  }

  const hex = expandHex(color.slice(1));
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}
