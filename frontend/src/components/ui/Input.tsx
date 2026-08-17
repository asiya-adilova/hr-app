import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
};

export function Input({
  label,
  error,
  hint,
  showCount,
  className = '',
  id,
  maxLength,
  value,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const length = typeof value === 'string' ? value.length : 0;

  return (
    <label className="block space-y-1.5 text-left">
      {label || (showCount && maxLength) ? (
        <span className="flex items-center justify-between gap-2">
          {label ? (
            <span className="text-sm font-medium text-ink-700">{label}</span>
          ) : (
            <span />
          )}
          {showCount && maxLength ? (
            <span
              className={`text-xs tabular-nums ${
                length >= maxLength ? 'text-rose-600' : 'text-ink-500'
              }`}
            >
              {length}/{maxLength}
            </span>
          ) : null}
        </span>
      ) : null}
      <input
        id={inputId}
        maxLength={maxLength}
        value={value}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 ${
          error ? 'border-rose-400' : 'border-line'
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-xs text-rose-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-500">{hint}</span>
      ) : null}
    </label>
  );
}
