import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input/max';
import flags from 'react-phone-number-input/flags';
import ru from 'react-phone-number-input/locale/ru';
import 'react-phone-number-input/style.css';
import { useDebouncedError } from '../../hooks/useDebouncedError.ts';

type PhoneFieldProps = {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
};

function phoneError(value: string) {
  if (!value || isValidPhoneNumber(value)) {
    return undefined;
  }

  return 'Укажите корректный номер телефона';
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
        className={`phone-input ${message ? 'phone-input-error' : ''}`}
      />
      {message ? <span className="text-xs text-rose-600">{message}</span> : null}
    </label>
  );
}
