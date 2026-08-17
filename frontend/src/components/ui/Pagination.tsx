import type { ButtonHTMLAttributes } from 'react';

type PaginationProps = {
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  onChange: (pageIndex: number) => void;
};

function PageButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}

export function Pagination({
  pageIndex,
  totalPages,
  totalCount,
  onChange,
}: PaginationProps) {
  const pages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
      <p>Всего: {totalCount}</p>
      <div className="flex items-center gap-2">
        <PageButton
          disabled={pageIndex <= 1}
          onClick={() => onChange(pageIndex - 1)}
        >
          Назад
        </PageButton>
        <span>
          {pageIndex} / {pages}
        </span>
        <PageButton
          disabled={pageIndex >= pages}
          onClick={() => onChange(pageIndex + 1)}
        >
          Вперёд
        </PageButton>
      </div>
    </div>
  );
}
