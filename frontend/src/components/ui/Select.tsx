import type { SelectHTMLAttributes } from 'react';

type Option = {
  value: string | number;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
};

export function SelectChevron({ className = 'right-3 h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-500 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function Select({
  label,
  error,
  options,
  placeholder = 'Выберите значение',
  className = '',
  value,
  ...props
}: SelectProps) {
  return (
    <label className="block space-y-1.5 text-left">
      {label ? (
        <span className="text-sm font-medium text-ink-700">{label}</span>
      ) : null}
      <span className="relative block">
        <select
          value={value}
          className={`w-full cursor-pointer appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 ${
            error ? 'border-rose-400' : 'border-line'
          } ${value ? 'text-ink-900' : 'text-slate-400'} ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron />
      </span>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
