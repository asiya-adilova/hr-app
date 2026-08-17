import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Select } from '../../../components/ui/Select.tsx';
import { yearSelectOptions } from '../../../utils/date.ts';
import {
  EDUCATION_SPECIALTY_MAX_LENGTH,
  INSTITUTION_NAME_MAX_LENGTH,
} from '../../../utils/validation.ts';
import type { CityItem } from '../../references/types/references.ts';
import { CountryCityFields, formatLocation } from './CountryCityFields.tsx';
import {
  DeleteCardButton,
  EditCardButton,
  ExpandCardButton,
} from './form-card-actions.tsx';

export type EducationCardItem = {
  key: string;
  id?: number;
  institutionName: string;
  specialty: string;
  educationLevelId: string;
  educationLevelName?: string;
  countryId: string;
  countryName?: string;
  cityId: string;
  cityName?: string;
  graduationYear: number;
  view: boolean;
  expanded: boolean;
};

type Option = {
  value: string | number;
  label: string;
};

type EducationCardProps = {
  item: EducationCardItem;
  index: number;
  options: Option[];
  countries: Option[];
  cities: CityItem[];
  errors: Record<string, string>;
  minYear?: number;
  saving?: boolean;
  onChange: (item: EducationCardItem) => void;
  onSave: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleExpand: () => void;
};

export function EducationCard({
  item,
  index,
  options,
  countries,
  cities,
  errors,
  minYear,
  saving,
  onChange,
  onSave,
  onEdit,
  onDelete,
  onToggleExpand,
}: EducationCardProps) {
  const levelLabel =
    item.educationLevelName ||
    options.find((option) => String(option.value) === item.educationLevelId)?.label ||
    '';
  const yearOptions = yearSelectOptions(minYear ?? 1900, 2100);
  if (
    item.graduationYear &&
    !yearOptions.some((option) => option.value === item.graduationYear)
  ) {
    yearOptions.push({
      value: item.graduationYear,
      label: String(item.graduationYear),
    });
  }

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
              {item.institutionName}
              {item.specialty ? ` · ${item.specialty}` : ''}
            </p>
            {locationLabel ? (
              <p className="mt-1 text-sm text-ink-500">{locationLabel}</p>
            ) : null}
            {item.expanded ? (
              <p className="mt-1 text-sm text-ink-500">
                {[levelLabel, item.graduationYear].filter(Boolean).join(' · ')}
              </p>
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
    <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
      <Input
        label="Учебное заведение"
        maxLength={INSTITUTION_NAME_MAX_LENGTH}
        value={item.institutionName}
        error={errors[`education-${index}-institution`]}
        onChange={(event) =>
          onChange({ ...item, institutionName: event.target.value })
        }
      />
      <Input
        label="Специальность"
        maxLength={EDUCATION_SPECIALTY_MAX_LENGTH}
        value={item.specialty}
        error={errors[`education-${index}-specialty`]}
        onChange={(event) => onChange({ ...item, specialty: event.target.value })}
      />
      <CountryCityFields
        countryId={item.countryId}
        cityId={item.cityId}
        countries={countries}
        cities={cities}
        countryError={errors[`education-${index}-country`]}
        cityError={errors[`education-${index}-city`]}
        onChange={(next) => onChange({ ...item, ...next })}
      />
      <Select
        label="Уровень образования"
        value={item.educationLevelId}
        options={options}
        error={errors[`education-${index}-level`]}
        onChange={(event) =>
          onChange({ ...item, educationLevelId: event.target.value })
        }
      />
      <Select
        label="Год окончания"
        value={item.graduationYear || ''}
        options={yearOptions}
        error={errors[`education-${index}-year`]}
        onChange={(event) =>
          onChange({
            ...item,
            graduationYear: event.target.value ? Number(event.target.value) : 0,
          })
        }
      />
      <div className="flex items-center justify-between md:col-span-2">
        <Button type="button" disabled={saving} onClick={onSave}>
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </Button>
        <DeleteCardButton onClick={onDelete} />
      </div>
    </div>
  );
}
