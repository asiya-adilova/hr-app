export function formatExperienceMonths(months?: number) {
  if (!months) {
    return '—';
  }

  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years && rest) {
    return `${years} г. ${rest} мес.`;
  }
  if (years) {
    return `${years} г.`;
  }
  return `${rest} мес.`;
}
