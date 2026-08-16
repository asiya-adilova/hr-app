export function toDateInput(value?: string | Date | null): string {
  if (!value) {
    return '';
  }

  const raw = typeof value === 'string' ? value : value.toISOString();
  return raw.slice(0, 10);
}

export function formatDate(value?: string | Date | null): string {
  const input = toDateInput(value);
  if (!input) {
    return '—';
  }

  const [year, month, day] = input.split('-');
  return `${day}.${month}.${year}`;
}
