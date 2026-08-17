import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

type Option = {
  value: string | number;
  label: string;
};

type SelectChangeEvent = {
  target: { value: string; name?: string };
};

type SelectPlacement = 'up' | 'down';

type SelectProps = {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
  value?: string | number;
  name?: string;
  disabled?: boolean;
  className?: string;
  placement?: SelectPlacement;
  onChange?: (event: SelectChangeEvent) => void;
};

export function SelectChevron({
  className = 'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`pointer-events-none text-ink-500 ${className}`}
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

export function useSelectMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointer(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }
      event.stopImmediatePropagation();
      setOpen(false);
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [open]);

  return { open, setOpen, rootRef, menuRef };
}

export function SelectMenu({
  open,
  anchorRef,
  menuRef,
  id,
  minWidth = 0,
  placement = 'down',
  children,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  id?: string;
  minWidth?: number;
  placement?: SelectPlacement;
  children: ReactNode;
}) {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    function update() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const width = Math.max(rect.width, minWidth);
      const left = Math.min(rect.left, window.innerWidth - width - 8);
      const position =
        placement === 'up'
          ? { top: 'auto', bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4, bottom: 'auto' };

      setStyle({
        ...position,
        left: Math.max(8, left),
        width,
      });
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef, minWidth, open, placement]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    menuRef.current
      ?.querySelector<HTMLElement>('.select-option.is-active')
      ?.scrollIntoView({ block: 'nearest' });
  }, [menuRef, open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div ref={menuRef} id={id} role="listbox" className="select-menu" style={style}>
      {children}
    </div>,
    document.body,
  );
}

export function SelectOption({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={`select-option ${active ? 'is-active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Select({
  label,
  error,
  options,
  placeholder = 'Выберите значение',
  className = '',
  value,
  name,
  disabled,
  placement,
  onChange,
}: SelectProps) {
  const { open, setOpen, rootRef, menuRef } = useSelectMenu();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const stringValue = value == null ? '' : String(value);
  const selected = options.find((option) => String(option.value) === stringValue);
  const summary = selected?.label ?? placeholder;

  function pick(next: string) {
    setOpen(false);
    onChange?.({ target: { value: next, name } });
  }

  return (
    <div ref={rootRef} className="relative min-w-0 space-y-1.5 text-left">
      {label ? (
        <span className="text-sm font-medium text-ink-700">{label}</span>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        className={`relative w-full rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-left text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-page disabled:text-ink-500 ${
          open ? 'border-brand-500 ring-4 ring-brand-500/10' : error ? 'border-rose-400' : 'border-line'
        } ${selected ? 'text-ink-900' : 'text-slate-400'} ${className}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
      >
        <span className="block truncate">{summary}</span>
        <SelectChevron
          className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <SelectMenu
        open={open}
        anchorRef={triggerRef}
        menuRef={menuRef}
        id={listId}
        placement={placement}
      >
        {placeholder ? (
          <SelectOption active={!stringValue} onClick={() => pick('')}>
            {placeholder}
          </SelectOption>
        ) : null}
        {options.length ? (
          options.map((option) => (
            <SelectOption
              key={option.value}
              active={String(option.value) === stringValue}
              onClick={() => pick(String(option.value))}
            >
              {option.label}
            </SelectOption>
          ))
        ) : (
          <p className="select-empty">Нет значений</p>
        )}
      </SelectMenu>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}
