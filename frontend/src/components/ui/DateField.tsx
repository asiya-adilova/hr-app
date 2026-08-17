import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  formatDate,
  getCalendarCells,
  toDateInput,
} from '../../utils/date.ts';
import { todayIsoDate } from '../../utils/validation.ts';
import { SelectChevron } from './Select.tsx';

type DateFieldProps = {
  label?: string;
  error?: string;
  invalidIfPast?: boolean;
  pastMessage?: string;
  value: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function parseView(value: string, min?: string, max?: string) {
  const iso = value || min || max || todayIsoDate();
  const [year, month] = toDateInput(iso).split('-').map(Number);
  return { year, month };
}

export function DateField({
  label,
  error,
  invalidIfPast,
  pastMessage = 'Укажите действительный паспорт',
  value,
  min,
  max,
  disabled,
  onChange,
}: DateFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => parseView(value, min, max));

  const minYear = min ? Number(min.slice(0, 4)) : new Date().getFullYear() - 80;
  const maxYear = max ? Number(max.slice(0, 4)) : new Date().getFullYear() + 20;
  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = minYear; year <= maxYear; year += 1) {
      list.push(year);
    }
    return list;
  }, [minYear, maxYear]);

  const cells = useMemo(
    () => getCalendarCells(view.year, view.month),
    [view.month, view.year],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function toggleOpen() {
    if (disabled) {
      return;
    }

    if (open) {
      setOpen(false);
      return;
    }

    setView(parseView(value, min, max));
    setOpen(true);
  }

  function isDisabled(iso: string) {
    return Boolean((min && iso < min) || (max && iso > max));
  }

  const pastError =
    invalidIfPast && value && value < todayIsoDate() ? pastMessage : undefined;
  const message = error || pastError;

  return (
    <div className="block space-y-1.5 text-left">
      {label ? (
        <span className="text-sm font-medium text-ink-700">{label}</span>
      ) : null}
      <div ref={rootRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={toggleOpen}
          className={`flex w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-page disabled:text-ink-500 ${
            message ? 'border-rose-400' : 'border-line'
          }`}
        >
          <span className={value ? 'text-ink-900' : 'text-slate-400'}>
            {value ? formatDate(value) : 'ДД.ММ.ГГГГ'}
          </span>
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-brand-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="16" rx="2.5" />
            <path d="M8 3v4M16 3v4M3 10h18" />
          </svg>
        </button>

        {open && !disabled ? (
          <div
            className="absolute z-30 mt-2 w-full rounded-2xl border border-line bg-white p-3 shadow-lg"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="mb-3 grid grid-cols-[1fr_5.5rem] gap-2">
              <span className="relative block">
                <select
                  value={view.month}
                  className="w-full appearance-none rounded-xl border border-line bg-white px-3 py-2 pr-8 text-sm font-medium text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  onChange={(event) =>
                    setView((current) => ({
                      ...current,
                      month: Number(event.target.value),
                    }))
                  }
                >
                  {MONTH_LABELS.map((name, index) => (
                    <option key={name} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
                <SelectChevron className="right-2.5 h-3.5 w-3.5" />
              </span>
              <span className="relative block">
                <select
                  value={view.year}
                  className="w-full appearance-none rounded-xl border border-line bg-white px-3 py-2 pr-8 text-sm font-medium text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  onChange={(event) =>
                    setView((current) => ({
                      ...current,
                      year: Number(event.target.value),
                    }))
                  }
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <SelectChevron className="right-2.5 h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              {WEEKDAY_LABELS.map((day) => (
                <span key={day} className="py-1">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((cell) => {
                const selected = cell.iso === value;
                const today = cell.iso === todayIsoDate();
                const outOfRange = isDisabled(cell.iso);

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    disabled={outOfRange}
                    onClick={() => {
                      onChange(cell.iso);
                      setOpen(false);
                    }}
                    className={`h-8 rounded-lg text-sm transition disabled:cursor-not-allowed disabled:opacity-30 ${
                      selected
                        ? 'bg-brand-600 font-semibold text-white'
                        : today
                          ? 'bg-brand-50 font-medium text-brand-700'
                          : cell.currentMonth
                            ? 'text-ink-900 hover:bg-slate-100'
                            : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      {message ? <span className="text-xs text-rose-600">{message}</span> : null}
    </div>
  );
}
