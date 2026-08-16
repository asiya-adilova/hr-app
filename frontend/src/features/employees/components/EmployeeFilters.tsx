import type { ReferenceItem } from '../../references/types/references.ts';
import type { EmployeeFilter } from '../types/employee-filter.ts';

type FilterKey =
  | 'departmentIds'
  | 'positionIds'
  | 'citizenshipIds'
  | 'nationalityIds'
  | 'educationLevelIds'
  | 'maritalStatusIds'
  | 'employmentTypeIds';

function CheckGroup({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: ReferenceItem[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-ink-900">{title}</legend>
      <div className="max-h-40 space-y-1 overflow-auto pr-1">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => onToggle(item.id)}
            />
            {item.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function EmployeeFilters({
  value,
  onChange,
  options,
}: {
  value: EmployeeFilter;
  onChange: (value: EmployeeFilter) => void;
  options: {
    departments: ReferenceItem[];
    positions: ReferenceItem[];
    citizenships: ReferenceItem[];
    nationalities: ReferenceItem[];
    educationLevels: ReferenceItem[];
    maritalStatuses: ReferenceItem[];
    employmentTypes: ReferenceItem[];
  };
}) {
  function toggle(key: FilterKey, id: number) {
    const current = value[key] ?? [];
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    onChange({ ...value, [key]: next });
  }

  return (
    <aside className="w-64 shrink-0 space-y-5 rounded-2xl border border-line bg-white p-4">
      <h2 className="text-sm font-semibold">Фильтры</h2>
      <CheckGroup
        title="Подразделение"
        items={options.departments}
        selected={value.departmentIds ?? []}
        onToggle={(id) => toggle('departmentIds', id)}
      />
      <CheckGroup
        title="Должность"
        items={options.positions}
        selected={value.positionIds ?? []}
        onToggle={(id) => toggle('positionIds', id)}
      />
      <CheckGroup
        title="Гражданство"
        items={options.citizenships}
        selected={value.citizenshipIds ?? []}
        onToggle={(id) => toggle('citizenshipIds', id)}
      />
      <CheckGroup
        title="Национальность"
        items={options.nationalities}
        selected={value.nationalityIds ?? []}
        onToggle={(id) => toggle('nationalityIds', id)}
      />
      <CheckGroup
        title="Образование"
        items={options.educationLevels}
        selected={value.educationLevelIds ?? []}
        onToggle={(id) => toggle('educationLevelIds', id)}
      />
      <CheckGroup
        title="Тип занятости"
        items={options.employmentTypes}
        selected={value.employmentTypeIds ?? []}
        onToggle={(id) => toggle('employmentTypeIds', id)}
      />
      <CheckGroup
        title="Семейное положение"
        items={options.maritalStatuses}
        selected={value.maritalStatusIds ?? []}
        onToggle={(id) => toggle('maritalStatusIds', id)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.hasDriverLicense === true}
          onChange={(event) =>
            onChange({
              ...value,
              hasDriverLicense: event.target.checked ? true : undefined,
            })
          }
        />
        Есть водительские права
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.militaryService === true}
          onChange={(event) =>
            onChange({
              ...value,
              militaryService: event.target.checked ? true : undefined,
            })
          }
        />
        Военная служба
      </label>
    </aside>
  );
}
