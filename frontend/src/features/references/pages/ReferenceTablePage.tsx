import { Link, useParams } from 'react-router-dom';
import { Table } from '../../../components/ui/Table.tsx';
import { routes } from '../../../constants/routes.ts';
import { useReferences } from '../hooks/useReferences.ts';
import { referenceCatalog } from '../types/reference-catalog.ts';
import type { CityItem, ReferenceMap } from '../types/references.ts';

export function ReferenceTablePage() {
  const params = useParams();
  const type = params.type as keyof ReferenceMap | undefined;
  const item = referenceCatalog.find((entry) => entry.key === type);
  const { data, loading, error } = useReferences();

  if (!item) {
    return <p className="text-rose-600">Справочник не найден</p>;
  }

  const rows = type ? data[type] : [];

  return (
    <div className="space-y-6">
      <div>
        <Link to={routes.adminReferences} className="text-sm text-brand-700">
          ← Все справочники
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{item.title}</h1>
        <p className="text-sm text-ink-500">{item.description}</p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-ink-500">Загружаем таблицу...</p>
      ) : type === 'cities' ? (
        <Table
          rows={data.cities}
          empty="Записей нет"
          columns={[
            { key: 'id', header: 'ID', render: (row: CityItem) => row.id },
            { key: 'name', header: 'Название', render: (row: CityItem) => row.name },
            {
              key: 'country',
              header: 'Страна',
              render: (row: CityItem) =>
                data.countries.find((country) => country.id === row.countryId)?.name ?? '—',
            },
          ]}
        />
      ) : (
        <Table
          rows={rows}
          empty="Записей нет"
          columns={[
            { key: 'id', header: 'ID', render: (row) => row.id },
            { key: 'name', header: 'Название', render: (row) => row.name },
          ]}
        />
      )}
    </div>
  );
}
