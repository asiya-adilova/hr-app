import { Button } from '../../../components/ui/Button.tsx';
import { DateField } from '../../../components/ui/DateField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { PhoneField } from '../../../components/ui/PhoneField.tsx';
import { Select } from '../../../components/ui/Select.tsx';
import { formatDate } from '../../../utils/date.ts';
import { todayIsoDate } from '../../../utils/validation.ts';
import {
  DeleteCardButton,
  EditCardButton,
  ExpandCardButton,
} from './form-card-actions.tsx';

export const RELATIONSHIP_OPTIONS = [
  { value: 'Отец', label: 'Отец' },
  { value: 'Мать', label: 'Мать' },
  { value: 'Супруг', label: 'Супруг' },
  { value: 'Супруга', label: 'Супруга' },
  { value: 'Сын', label: 'Сын' },
  { value: 'Дочь', label: 'Дочь' },
  { value: 'Брат', label: 'Брат' },
  { value: 'Сестра', label: 'Сестра' },
  { value: 'Дедушка', label: 'Дедушка' },
  { value: 'Бабушка', label: 'Бабушка' },
];

export type RelativeCardItem = {
  key: string;
  id?: number;
  fullName: string;
  relationshipType: string;
  occupation: string;
  birthDate: string;
  phone: string;
  view: boolean;
  expanded: boolean;
};

type RelativeCardProps = {
  item: RelativeCardItem;
  index: number;
  errors: Record<string, string>;
  saving?: boolean;
  onChange: (item: RelativeCardItem) => void;
  onSave: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleExpand: () => void;
};

export function RelativeCard({
  item,
  index,
  errors,
  saving,
  onChange,
  onSave,
  onEdit,
  onDelete,
  onToggleExpand,
}: RelativeCardProps) {
  const relationshipOptions =
    item.relationshipType &&
    !RELATIONSHIP_OPTIONS.some((option) => option.value === item.relationshipType)
      ? [{ value: item.relationshipType, label: item.relationshipType }, ...RELATIONSHIP_OPTIONS]
      : RELATIONSHIP_OPTIONS;

  if (item.view) {
    return (
      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            onClick={onToggleExpand}
          >
            <p className="font-medium text-ink-900">{item.fullName}</p>
            {item.relationshipType ? (
              <p className="mt-1 text-sm text-ink-500">{item.relationshipType}</p>
            ) : null}
            {item.expanded ? (
              <>
                {item.occupation ? (
                  <p className="mt-1 text-sm text-ink-500">{item.occupation}</p>
                ) : null}
                {item.birthDate ? (
                  <p className="mt-1 text-sm text-ink-500">
                    Дата рождения: {formatDate(item.birthDate)}
                  </p>
                ) : null}
                {item.phone ? (
                  <p className="mt-1 text-sm text-ink-500">{item.phone}</p>
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
      className={`grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-2 ${
        errors[`relative-${index}-duplicate`] ? 'ring-1 ring-rose-400' : ''
      }`}
    >
      <Input
        label="ФИО"
        value={item.fullName}
        error={errors[`relative-${index}-name`]}
        onChange={(event) => onChange({ ...item, fullName: event.target.value })}
      />
      <Select
        label="Родство"
        value={item.relationshipType}
        options={relationshipOptions}
        error={errors[`relative-${index}-relationship`]}
        onChange={(event) => onChange({ ...item, relationshipType: event.target.value })}
      />
      <Input
        label="Род занятий"
        value={item.occupation}
        error={errors[`relative-${index}-occupation`]}
        onChange={(event) => onChange({ ...item, occupation: event.target.value })}
      />
      <DateField
        label="Дата рождения"
        value={item.birthDate}
        max={todayIsoDate()}
        error={errors[`relative-${index}-birthDate`]}
        onChange={(value) => onChange({ ...item, birthDate: value })}
      />
      <div className="md:col-span-2">
        <PhoneField
          label="Телефон"
          value={item.phone}
          error={errors[`relative-${index}-phone`]}
          onChange={(value) => onChange({ ...item, phone: value })}
        />
      </div>
      {errors[`relative-${index}-duplicate`] ? (
        <p className="text-xs text-rose-600 md:col-span-2">
          {errors[`relative-${index}-duplicate`]}
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
