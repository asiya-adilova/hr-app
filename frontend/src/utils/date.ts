export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const MONTH_LABELS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function toDateInput(value?: string | Date | null): string {
  if (!value) {
    return '';
  }

  const raw = typeof value === 'string' ? value : value.toISOString();
  return raw.slice(0, 10);
}

export function yearFromIsoDate(value?: string): number | undefined {
  if (!value || !/^\d{4}/.test(value)) {
    return undefined;
  }

  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

function currentCalendarYear(): number {
  return new Date().getFullYear();
}

export function yearSelectOptions(
  minYear: number,
  maxYear = currentCalendarYear(),
): { value: number; label: string }[] {
  const start = Math.min(minYear, maxYear);
  const end = Math.max(minYear, maxYear);
  const options: { value: number; label: string }[] = [];

  for (let year = end; year >= start; year -= 1) {
    options.push({ value: year, label: String(year) });
  }

  return options;
}

export function formatDate(value?: string | Date | null): string {
  const input = toDateInput(value);
  if (!input) {
    return '—';
  }

  const [year, month, day] = input.split('-');
  return `${day}.${month}.${year}`;
}

export type CalendarCell = {
  iso: string;
  day: number;
  currentMonth: boolean;
};

export function getCalendarCells(year: number, month: number): CalendarCell[] {
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let index = firstWeekday - 1; index >= 0; index -= 1) {
    const date = new Date(year, month - 2, daysInPrevMonth - index);
    cells.push({
      iso: toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
      day: date.getDate(),
      currentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      iso: toIsoDate(year, month, day),
      day,
      currentMonth: true,
    });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const date = new Date(year, month, nextDay);
    cells.push({
      iso: toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
      day: date.getDate(),
      currentMonth: false,
    });
    nextDay += 1;
  }

  return cells;
}
