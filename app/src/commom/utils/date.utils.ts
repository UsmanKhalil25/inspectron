export function isValidDateString(dateStr?: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}
