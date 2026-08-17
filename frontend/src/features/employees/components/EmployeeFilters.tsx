import { useState } from 'react';
import { Checkbox } from '../../../components/ui/Checkbox.tsx';
import { DateField } from '../../../components/ui/DateField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { MultiSelect } from '../../../components/ui/MultiSelect.tsx';
import type { CityItem, ReferenceItem } from '../../references/types/references.ts';
import type { EmployeeFilter } from '../types/employee-filter.ts';

type FilterKey =
  | 'countryIds'
  | 'cityIds'
  | 'departmentIds'
  | 'positionIds'
  | 'citizenshipIds'
  | 'nationalityIds'
  | 'educationLevelIds'
  | 'maritalStatusIds'
  | 'employmentTypeIds';

function toOptions(items: ReferenceItem[]) {
  return items.map((item) => ({ value: item.id, label: item.name }));
}

function citiesForCountries(cities: CityItem[], countryIds: number[]) {
  if (!countryIds.length) {
    return cities;
  }

  return cities.filter((city) => countryIds.includes(city.countryId));
}

function parseYears(raw: string) {
  if (raw === '') {
    return undefined;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return Math.floor(value);
}

export function EmployeeFilters({
  value,
  onChange,
  options,
}: {
  value: EmployeeFilter;
  onChange: (value: EmployeeFilter) => void;
  options: {
    countries: ReferenceItem[];
    cities: CityItem[];
    departments: ReferenceItem[];
    positions: ReferenceItem[];
    citizenships: ReferenceItem[];
    nationalities: ReferenceItem[];
    educationLevels: ReferenceItem[];
    maritalStatuses: ReferenceItem[];
    employmentTypes: ReferenceItem[];
  };
}) {
  const [open, setOpen] = useState(false);
  const countryIds = value.countryIds ?? [];
  const cityOptions = citiesForCountries(options.cities, countryIds);

  function setIds(key: FilterKey, ids: number[]) {
    onChange({ ...value, [key]: ids });
  }

  function setCountryIds(ids: number[]) {
    const allowedCityIds = new Set(
      citiesForCountries(options.cities, ids).map((city) => city.id),
    );
    const nextCityIds = (value.cityIds ?? []).filter((id) => allowedCityIds.has(id));

    onChange({
      ...value,
      countryIds: ids,
      cityIds: nextCityIds,
    });
  }

  return (
    <aside className="rounded-2xl border border-line bg-white lg:w-72 lg:shrink-0">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold lg:hidden"
        onClick={() => setOpen((current) => !current)}
      >
        Фильтры
        <span className="text-ink-500">{open ? 'Скрыть' : 'Показать'}</span>
      </button>
      <div className={`space-y-4 p-4 ${open ? 'block' : 'hidden'} lg:block`}>
        <h2 className="hidden text-sm font-semibold lg:block">Фильтры</h2>
        <MultiSelect
          label="Подразделение"
          options={toOptions(options.departments)}
          value={value.departmentIds ?? []}
          onChange={(ids) => setIds('departmentIds', ids)}
        />
        <MultiSelect
          label="Должность"
          options={toOptions(options.positions)}
          value={value.positionIds ?? []}
          onChange={(ids) => setIds('positionIds', ids)}
        />
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-ink-700">
            Стаж по специальности, лет
          </span>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                label="Минимум"
                placeholder="лет"
                className="px-2.5 py-2"
                value={value.minSpecialtyExperienceYears ?? ''}
                onChange={(event) =>
                  onChange({
                    ...value,
                    minSpecialtyExperienceYears: parseYears(event.target.value),
                  })
                }
              />
            </div>
            <span className="mb-2.5 shrink-0 text-sm text-ink-500" aria-hidden>
              -
            </span>
            <div className="min-w-0 flex-1">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                label="Максимум"
                placeholder="лет"
                className="px-2.5 py-2"
                value={value.maxSpecialtyExperienceYears ?? ''}
                onChange={(event) =>
                  onChange({
                    ...value,
                    maxSpecialtyExperienceYears: parseYears(event.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-ink-700">Дата приёма</span>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <DateField
                label="От"
                clearable
                value={value.hireDateFrom ?? ''}
                max={value.hireDateTo}
                onChange={(next) => {
                  const hireDateFrom = next || undefined;
                  const hireDateTo =
                    hireDateFrom && value.hireDateTo && value.hireDateTo < hireDateFrom
                      ? undefined
                      : value.hireDateTo;
                  onChange({ ...value, hireDateFrom, hireDateTo });
                }}
              />
            </div>
            <span className="mb-2.5 shrink-0 text-sm text-ink-500" aria-hidden>
              -
            </span>
            <div className="min-w-0 flex-1">
              <DateField
                label="До"
                clearable
                menuAlign="right"
                value={value.hireDateTo ?? ''}
                min={value.hireDateFrom}
                onChange={(next) =>
                  onChange({ ...value, hireDateTo: next || undefined })
                }
              />
            </div>
          </div>
        </div>
        <MultiSelect
          label="Образование"
          options={toOptions(options.educationLevels)}
          value={value.educationLevelIds ?? []}
          onChange={(ids) => setIds('educationLevelIds', ids)}
        />
        <MultiSelect
          label="Тип занятости"
          options={toOptions(options.employmentTypes)}
          value={value.employmentTypeIds ?? []}
          onChange={(ids) => setIds('employmentTypeIds', ids)}
        />
        <MultiSelect
          label="Страна"
          options={toOptions(options.countries)}
          value={countryIds}
          onChange={setCountryIds}
        />
        <MultiSelect
          label="Город"
          options={toOptions(cityOptions)}
          value={value.cityIds ?? []}
          onChange={(ids) => setIds('cityIds', ids)}
        />
        <MultiSelect
          label="Национальность"
          options={toOptions(options.nationalities)}
          value={value.nationalityIds ?? []}
          onChange={(ids) => setIds('nationalityIds', ids)}
        />
        <MultiSelect
          label="Гражданство"
          options={toOptions(options.citizenships)}
          value={value.citizenshipIds ?? []}
          onChange={(ids) => setIds('citizenshipIds', ids)}
        />
        <MultiSelect
          label="Семейное положение"
          options={toOptions(options.maritalStatuses)}
          value={value.maritalStatusIds ?? []}
          onChange={(ids) => setIds('maritalStatusIds', ids)}
        />
        <div className="space-y-3 border-t border-line pt-4">
          <Checkbox
            label="Есть водительские права"
            checked={value.hasDriverLicense === true}
            onChange={(checked) =>
              onChange({
                ...value,
                hasDriverLicense: checked ? true : undefined,
              })
            }
          />
          <Checkbox
            label="Военная служба"
            checked={value.militaryService === true}
            onChange={(checked) =>
              onChange({
                ...value,
                militaryService: checked ? true : undefined,
              })
            }
          />
        </div>
      </div>
    </aside>
  );
}
