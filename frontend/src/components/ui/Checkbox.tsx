import type { InputHTMLAttributes, ReactNode } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  label?: ReactNode;
  onChange?: (checked: boolean) => void;
};

export function Checkbox({
  label,
  className = '',
  checked,
  disabled,
  onChange,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-2.5 text-sm text-ink-700 ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className}`}
    >
      <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          {...props}
        />
        <span className="flex h-5 w-5 items-center justify-center rounded-md border border-line bg-white text-transparent shadow-sm transition peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:text-white peer-focus-visible:border-brand-500 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/10">
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12.5l4.2 4.2L19 7.5" />
          </svg>
        </span>
      </span>
      {label ? <span className="min-w-0 leading-5">{label}</span> : null}
    </label>
  );
}
