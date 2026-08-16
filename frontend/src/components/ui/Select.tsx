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

export function Select({
  label,
  error,
  options,
  placeholder = 'Выберите значение',
  className = '',
  ...props
}: SelectProps) {
  return (
    <label className="block space-y-1.5 text-left">
      {label ? (
        <span className="text-sm font-medium text-ink-700">{label}</span>
      ) : null}
      <select
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 ${
          error ? 'border-rose-400' : 'border-line'
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
