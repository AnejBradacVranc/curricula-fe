export function formatHours(value: number | string) {
  const hours = Number(value);

  if (Number.isNaN(hours)) {
    return String(value);
  }

  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(/\.0$/, "");
}

export function sumHours(values: Array<number | string>) {
  return values.reduce<number>((sum, value) => sum + Number(value), 0);
}
