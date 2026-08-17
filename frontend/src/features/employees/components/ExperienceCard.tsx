import { Button } from '../../../components/ui/Button.tsx';
import { DateField } from '../../../components/ui/DateField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Select } from '../../../components/ui/Select.tsx';
import { formatDate } from '../../../utils/date.ts';
import { todayIsoDate } from '../../../utils/validation.ts';
import type { CityItem } from '../../references/types/references.ts';
import { CountryCityFields, formatLocation } from './CountryCityFields.tsx';
import {
  DeleteCardButton,
  EditCardButton,
  ExpandCardButton,
} from './form-card-actions.tsx';

export type ExperienceCardItem = {
  key: string;
  id?: number;
  companyName: string;
  positionId: string;
  positionName?: string;
  countryId: string;
  countryName?: string;
  cityId: string;
  cityName?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
  view: boolean;
  expanded: boolean;
};

type Option = {
  value: string | number;
  label: string;
};

type ExperienceCardProps = {
  item: ExperienceCardItem;
  index: number;
  options: Option[];
  countries: Option[];
  cities: CityItem[];
  errors: Record<string, string>;
  saving?: boolean;
  onChange: (item: ExperienceCardItem) => void;
  onSave: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleExpand: () => void;
};

export function ExperienceCard({
  item,
  index,
  options,
  countries,
  cities,
  errors,
  saving,
  onChange,
  onSave,
  onEdit,
  onDelete,
  onToggleExpand,
}: ExperienceCardProps) {
  const positionLabel =
    item.positionName ||
    options.find((option) => String(option.value) === item.positionId)?.label ||
    '';
  const locationLabel = formatLocation(
    item.cityName || cities.find((city) => String(city.id) === item.cityId)?.name,
    item.countryName ||
      countries.find((option) => String(option.value) === item.countryId)?.label,
  );

  if (item.view) {
    return (
      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            onClick={onToggleExpand}
          >
            <p className="font-medium text-ink-900">
              {positionLabel} · {item.companyName}
            </p>
            {locationLabel ? (
              <p className="mt-1 text-sm text-ink-500">{locationLabel}</p>
            ) : null}
            {item.expanded ? (
              <>
                <p className="mt-1 text-sm text-ink-500">
                  {formatDate(item.startDate)} —{' '}
                  {item.isCurrent ? 'н.в.' : formatDate(item.endDate)}
                </p>
                {item.responsibilities ? (
                  <p className="mt-2 text-sm text-ink-700">{item.responsibilities}</p>
                ) : null}
              </>
            ) : null}
          </button>
          <div className="flex shrink-0 items-center">
            <ExpandCardButton expanded={item.expanded} onClick={onToggleExpand} />
            <EditCardButton onClick={onEdit} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-2 md:p-5 ${
        errors[`experience-${index}-duplicate`] ? 'ring-1 ring-rose-400' : ''
      }`}
    >
      <Input
        label="Организация"
        value={item.companyName}
        error={errors[`experience-${index}-company`]}
        onChange={(event) => onChange({ ...item, companyName: event.target.value })}
      />
      <Select
        label="Должность"
        value={item.positionId}
        options={options}
        error={errors[`experience-${index}-position`]}
        onChange={(event) => onChange({ ...item, positionId: event.target.value })}
      />
      <CountryCityFields
        countryId={item.countryId}
        cityId={item.cityId}
        countries={countries}
        cities={cities}
        countryError={errors[`experience-${index}-country`]}
        cityError={errors[`experience-${index}-city`]}
        onChange={(next) => onChange({ ...item, ...next })}
      />
      <DateField
        label="Дата начала"
        value={item.startDate}
        max={todayIsoDate()}
        error={errors[`experience-${index}-start`]}
        onChange={(value) => onChange({ ...item, startDate: value })}
      />
      <div className="space-y-3">
        <DateField
          label="Дата окончания"
          value={item.endDate}
          disabled={item.isCurrent}
          error={errors[`experience-${index}-end`]}
          onChange={(value) => onChange({ ...item, endDate: value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.isCurrent}
            onChange={(event) =>
              onChange({
                ...item,
                isCurrent: event.target.checked,
                endDate: event.target.checked ? '' : item.endDate,
              })
            }
          />
          Текущее место работы
        </label>
      </div>
      <div className="md:col-span-2">
        <Input
          label="Обязанности"
          value={item.responsibilities}
          error={errors[`experience-${index}-responsibilities`]}
          onChange={(event) =>
            onChange({ ...item, responsibilities: event.target.value })
          }
        />
      </div>
      {errors[`experience-${index}-duplicate`] ? (
        <p className="text-xs text-rose-600 md:col-span-2">
          {errors[`experience-${index}-duplicate`]}
        </p>
      ) : null}
      <div className="flex items-center justify-between md:col-span-2">
        <Button type="button" disabled={saving} onClick={onSave}>
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </Button>
        <DeleteCardButton onClick={onDelete} />
      </div>
    </div>
  );
}
