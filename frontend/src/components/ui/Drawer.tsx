import { useEffect, useState, type ReactNode } from 'react';

const CLOSE_MS = 320;

type DrawerProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  headerAction?: ReactNode;
};

export function Drawer({ open, title, children, onClose, headerAction }: DrawerProps) {
  const [present, setPresent] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setPresent(true);
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true));
      });
      return () => window.cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setPresent(false), CLOSE_MS);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!present) {
      return;
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [present, onClose]);

  if (!present) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Закрыть"
        onClick={onClose}
      />
      <aside
        className={`absolute inset-y-0 right-0 z-10 flex w-full flex-col bg-page shadow-2xl transition-transform duration-300 ease-out lg:w-1/2 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-4 py-3 md:px-6">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
            onClick={onClose}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Назад
          </button>
          <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h2>
          {headerAction}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </aside>
    </div>
  );
}
