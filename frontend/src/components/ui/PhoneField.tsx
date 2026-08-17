import { useRef, type ElementType } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input/max';
import flags from 'react-phone-number-input/flags';
import ru from 'react-phone-number-input/locale/ru';
import 'react-phone-number-input/style.css';
import { useDebouncedError } from '../../hooks/useDebouncedError.ts';
import {
  SelectChevron,
  SelectMenu,
  SelectOption,
  useSelectMenu,
} from './Select.tsx';

type PhoneFieldProps = {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
};

type CountryOption = {
  value?: string;
  label: string;
  divider?: boolean;
};

type CountrySelectProps = {
  value?: string;
  onChange: (value?: string) => void;
  options: CountryOption[];
  disabled?: boolean;
  readOnly?: boolean;
  iconComponent: ElementType;
};

function phoneError(value: string) {
  if (!value || isValidPhoneNumber(value)) {
    return undefined;
  }

  return 'Укажите корректный номер телефона';
}

function PhoneCountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  iconComponent: Icon,
}: CountrySelectProps) {
  const { open, setOpen, rootRef, menuRef } = useSelectMenu();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);
  const locked = disabled || readOnly;

  return (
    <div ref={rootRef} className="phone-country">
      <button
        ref={triggerRef}
        type="button"
        disabled={locked}
        className="phone-country-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={selected?.label ?? 'Страна'}
        onClick={() => {
          if (!locked) {
            setOpen((current) => !current);
          }
        }}
      >
        <Icon aria-hidden country={value} label={selected?.label ?? ''} />
        <SelectChevron className={`h-3.5 w-3.5 ${open ? 'rotate-180' : ''}`} />
      </button>
      <SelectMenu open={open} anchorRef={triggerRef} menuRef={menuRef} minWidth={256}>
        {options.map((option, index) =>
          option.divider ? (
            <div key={`divider-${index}`} className="mx-2 my-1 border-t border-line" />
          ) : (
            <SelectOption
              key={option.value ?? 'ZZ'}
              active={(option.value ?? '') === (value ?? '')}
              onClick={() => {
                setOpen(false);
                onChange(option.value);
              }}
            >
              {option.label}
            </SelectOption>
          ),
        )}
      </SelectMenu>
    </div>
  );
}

export function PhoneField({ label, error, value, onChange }: PhoneFieldProps) {
  const idle = useDebouncedError(value, phoneError);
  const message = error || idle.error;

  return (
    <label className="block space-y-1.5 text-left">
      {label ? (
        <span className="text-sm font-medium text-ink-700">{label}</span>
      ) : null}
      <PhoneInput
        international
        defaultCountry="UZ"
        limitMaxLength
        countryCallingCodeEditable={false}
        labels={ru}
        locales="ru"
        flags={flags}
        value={value || undefined}
        onChange={(next) => onChange(next ?? '')}
        onBlur={idle.showNow}
        countrySelectComponent={PhoneCountrySelect}
        className={`phone-input ${message ? 'phone-input-error' : ''}`}
      />
      {message ? <span className="text-xs text-rose-600">{message}</span> : null}
    </label>
  );
}
