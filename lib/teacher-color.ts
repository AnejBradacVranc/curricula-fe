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

export function hasColor(color: string | null | undefined): color is string {
  return Boolean(color && isHexColor(color));
}

/** Mix into the card surface so tints stay readable in light and dark. */
export function colorWithOpacity(
  color: string,
  opacity = 0.28,
  fallback = "var(--primary)",
): string {
  const amount = Math.round(opacity * 100);

  if (!isHexColor(color)) {
    return `color-mix(in srgb, ${fallback} ${amount}%, var(--card))`;
  }

  return `color-mix(in srgb, ${color} ${amount}%, var(--card))`;
}
