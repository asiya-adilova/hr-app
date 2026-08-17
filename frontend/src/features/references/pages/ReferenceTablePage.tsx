import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Input } from '../../../components/ui/Input.tsx';
import { Table } from '../../../components/ui/Table.tsx';
import { routes } from '../../../constants/routes.ts';
import { referencesApi } from '../api/references.api.ts';
import { referenceCatalog } from '../types/reference-catalog.ts';
import type { CityItem, ReferenceItem, ReferenceMap } from '../types/references.ts';

export function ReferenceTablePage() {
  const params = useParams();
  const type = params.type as keyof ReferenceMap | undefined;
  const item = referenceCatalog.find((entry) => entry.key === type);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [rows, setRows] = useState<ReferenceItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [countries, setCountries] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearch('');
    setDebouncedSearch('');
  }, [type]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (type !== 'cities') {
      return;
    }

    let active = true;
    referencesApi
      .search('/countries')
      .then((result) => {
        if (active) {
          setCountries(result);
        }
      })
      .catch(() => {
        if (active) {
          setCountries([]);
        }
      });

    return () => {
      active = false;
    };
  }, [type]);

  useEffect(() => {
    if (!item) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    const request =
      item.key === 'cities'
        ? referencesApi.searchCities(debouncedSearch).then((result) => {
            if (active) {
              setCities(result);
            }
          })
        : referencesApi.search(item.path, debouncedSearch).then((result) => {
            if (active) {
              setRows(result);
            }
          });

    request
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error ? caught.message : 'Не удалось загрузить справочник',
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [item?.key, item?.path, debouncedSearch]);

  if (!item) {
    return <p className="text-rose-600">Справочник не найден</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to={routes.adminReferences} className="text-sm text-brand-700">
            ← Все справочники
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{item.title}</h1>
          <p className="text-sm text-ink-500">{item.description}</p>
        </div>
        <div className="w-full sm:max-w-72">
          <Input
            placeholder="Поиск по названию"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-ink-500">Загружаем таблицу...</p>
      ) : item.key === 'cities' ? (
        <Table
          rows={cities}
          empty="Записей нет"
          columns={[
            { key: 'id', header: 'ID', render: (row: CityItem) => row.id },
            { key: 'name', header: 'Название', render: (row: CityItem) => row.name },
            {
              key: 'country',
              header: 'Страна',
              render: (row: CityItem) =>
                countries.find((country) => country.id === row.countryId)?.name ?? '—',
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
