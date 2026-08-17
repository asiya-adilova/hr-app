import type { ReactNode } from 'react';

type Column<T> = {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
};

type TableProps<T> = {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
  startNumber?: number;
};

export function Table<T extends { id: number | string }>({
  rows,
  columns,
  empty = 'Нет данных',
  startNumber,
}: TableProps<T>) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-ink-500">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="bg-slate-50 text-ink-500">
          <tr>
            {startNumber != null ? (
              <th className="w-14 px-4 py-3 font-medium">№</th>
            ) : null}
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="border-t border-line">
              {startNumber != null ? (
                <td className="px-4 py-3 text-ink-500">{startNumber + index}</td>
              ) : null}
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3">
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
