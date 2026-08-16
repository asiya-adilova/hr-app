import { Link } from 'react-router-dom';
import { routes } from '../../../constants/routes.ts';
import { useReferences } from '../hooks/useReferences.ts';
import { referenceCatalog } from '../types/reference-catalog.ts';

export function ReferencesPage() {
  const { data, loading, error } = useReferences();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-700">Админ-панель</p>
        <h1 className="text-2xl font-bold">Справочники</h1>
        <p className="mt-1 text-sm text-ink-500">
          Статические таблицы: гражданство, категории прав, подразделения и остальные.
        </p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {referenceCatalog.map((item) => (
          <Link
            key={item.key}
            to={routes.adminReference(item.key)}
            className="rounded-2xl border border-line bg-white p-5 hover:border-brand-500"
          >
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-ink-500">{item.description}</p>
            <p className="mt-4 text-sm font-medium text-brand-700">
              {loading ? '...' : `${data[item.key].length} записей`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
