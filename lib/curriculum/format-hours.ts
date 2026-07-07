export function formatHours(value: number | string) {
  const hours = Number(value);

  if (Number.isNaN(hours)) {
    return String(value);
  }

  if (Number.isInteger(hours)) {
    return String(hours);
  }

  return hours.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

export function sumHours(values: Array<number | string>) {
  return values.reduce<number>((sum, value) => sum + Number(value), 0);
}
