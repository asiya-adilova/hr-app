import type { ReactNode } from 'react';

type IconButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
};

function IconButton({ label, onClick, className = '', children }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`rounded-lg p-1.5 transition ${className}`}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Icon({ path }: { path: string }) {
  return (
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
      <path d={path} />
    </svg>
  );
}

export function DeleteCardButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      label="Удалить"
      onClick={onClick}
      className="text-rose-600 hover:bg-rose-50"
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
        <path d="M4 7h16" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </IconButton>
  );
}

export function EditCardButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      label="Изменить"
      onClick={onClick}
      className="text-ink-500 hover:bg-white hover:text-brand-700"
    >
      <Icon path="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </IconButton>
  );
}

export function SectionEditButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      label="Изменить"
      onClick={onClick}
      className="text-brand-700 hover:bg-brand-50"
    >
      <Icon path="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </IconButton>
  );
}

export function ExpandCardButton({
  expanded,
  onClick,
}: {
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <IconButton
      label={expanded ? 'Свернуть' : 'Развернуть'}
      onClick={onClick}
      className="text-ink-500 hover:bg-white hover:text-brand-700"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition ${expanded ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </IconButton>
  );
}
