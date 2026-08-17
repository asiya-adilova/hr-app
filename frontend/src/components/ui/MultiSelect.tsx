import { useId, useRef } from 'react';
import { Checkbox } from './Checkbox.tsx';
import { SelectChevron, SelectMenu, useSelectMenu } from './Select.tsx';

type Option = {
  value: number;
  label: string;
};

type MultiSelectProps = {
  label?: string;
  options: Option[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
};

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Все',
}: MultiSelectProps) {
  const { open, setOpen, rootRef, menuRef } = useSelectMenu();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `Выбрано: ${selectedLabels.length}`;

  function toggle(id: number) {
    onChange(
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  }

  return (
    <div ref={rootRef} className="relative space-y-1.5 text-left">
      {label ? (
        <span className="text-sm font-medium text-ink-700">{label}</span>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        className={`relative w-full rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-left text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 ${
          open ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-line'
        } ${value.length ? 'text-ink-900' : 'text-slate-400'}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="block truncate">{summary}</span>
        <SelectChevron
          className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <SelectMenu open={open} anchorRef={triggerRef} menuRef={menuRef} id={listId}>
        {options.length ? (
          options.map((option) => (
            <div key={option.value} className="rounded-lg px-1.5 py-1.5 hover:bg-slate-50">
              <Checkbox
                label={option.label}
                checked={value.includes(option.value)}
                onChange={() => toggle(option.value)}
              />
            </div>
          ))
        ) : (
          <p className="select-empty">Нет значений</p>
        )}
      </SelectMenu>
    </div>
  );
}
