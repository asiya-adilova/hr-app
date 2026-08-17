import type { ButtonHTMLAttributes } from 'react';
import { PAGE_SIZE_OPTIONS } from '../../constants/pagination.ts';
import { Select } from './Select.tsx';

type PaginationProps = {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
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
  pageSize,
  totalPages,
  totalCount,
  onChange,
  onPageSizeChange,
}: PaginationProps) {
  const pages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p>Всего: {totalCount}</p>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">На странице</span>
          <div className="w-24">
            <Select
              placeholder=""
              placement="up"
              value={pageSize}
              options={PAGE_SIZE_OPTIONS.map((size) => ({
                value: size,
                label: String(size),
              }))}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            />
          </div>
        </div>
      </div>
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
