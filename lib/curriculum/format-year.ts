/** Formats a grade number as "3. letnik". */
export function formatYearLabel(year: number): string {
  return `${year}. letnik`;
}

/** Formats grade + class label as "3.A". */
export function formatClassLabel(year: number, label: string): string {
  return `${year}.${label.toUpperCase()}`;
}
