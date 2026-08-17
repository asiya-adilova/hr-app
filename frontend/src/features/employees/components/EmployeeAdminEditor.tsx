import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button } from '../../../components/ui/Button.tsx';
import { DateField } from '../../../components/ui/DateField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { PhoneField } from '../../../components/ui/PhoneField.tsx';
import { Select } from '../../../components/ui/Select.tsx';
import { ApiError } from '../../../services/api-client.ts';
import {
  BIRTH_DATE_MAX,
  digitsOnly,
  lettersOnly,
} from '../../../utils/validation.ts';
import { useReferences } from '../../references/hooks/useReferences.ts';
import { employeeApi } from '../api/employee.api.ts';
import type { EmployeeDetails as EmployeeDetailsType } from '../types/employee.ts';
import {
  addEducationFieldErrors,
  addExperienceFieldErrors,
  addRelativeFieldErrors,
  collectJobErrors,
  collectPersonalErrors,
  educationPayload,
  emptyEducation,
  emptyExperience,
  emptyRelative,
  experiencePayload,
  fromEmployee,
  jobPayload,
  personalPayload,
  relativePayload,
  type AdminFormValues,
} from '../helpers/admin-employee-form.ts';
import { CountryCityFields } from './CountryCityFields.tsx';
import { EducationCard } from './EducationCard.tsx';
import {
  EmployeeDetails,
  type EmployeeDetailsSection,
} from './EmployeeDetails.tsx';
import { ExperienceCard } from './ExperienceCard.tsx';
import { SectionEditButton } from './form-card-actions.tsx';
import { RelativeCard } from './RelativeCard.tsx';

const YES_NO_OPTIONS = [
  { value: 'true', label: 'Да' },
  { value: 'false', label: 'Нет' },
];

type EmployeeAdminEditorProps = {
  employee: EmployeeDetailsType;
  onSaved?: () => void;
  onReload: () => void;
};

export function EmployeeAdminEditor({
  employee,
  onSaved,
  onReload,
}: EmployeeAdminEditorProps) {
  const { data: refs, loading, error: refsError } = useReferences();
  const [editing, setEditing] = useState<EmployeeDetailsSection | null>(null);
  const [values, setValues] = useState<AdminFormValues>(() => fromEmployee(employee));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setValues(fromEmployee(employee));
    setEditing(null);
    setFieldErrors({});
    setActionError(null);
  }, [employee]);

  const options = useMemo(
    () => ({
      genders: refs.genders.map((item) => ({ value: item.id, label: item.name })),
      citizenships: refs.citizenships.map((item) => ({ value: item.id, label: item.name })),
      nationalities: refs.nationalities.map((item) => ({ value: item.id, label: item.name })),
      departments: refs.departments.map((item) => ({ value: item.id, label: item.name })),
      positions: refs.positions.map((item) => ({ value: item.id, label: item.name })),
      employmentTypes: refs.employmentTypes.map((item) => ({
        value: item.id,
        label: item.name,
      })),
      educationLevels: refs.educationLevels.map((item) => ({
        value: item.id,
        label: item.name,
      })),
      maritalStatuses: refs.maritalStatuses.map((item) => ({
        value: item.id,
        label: item.name,
      })),
      driverLicenseCategories: refs.driverLicenseCategories.map((item) => ({
        value: item.id,
        label: item.name,
      })),
      countries: refs.countries.map((item) => ({ value: item.id, label: item.name })),
    }),
    [refs],
  );

  function setField<K extends keyof AdminFormValues>(key: K, value: AdminFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function startEdit(section: EmployeeDetailsSection) {
    setValues(fromEmployee(employee));
    setFieldErrors({});
    setActionError(null);
    setEditing(section);
  }

  function cancelEdit() {
    setValues(fromEmployee(employee));
    setFieldErrors({});
    setActionError(null);
    setEditing(null);
  }

  async function finishAndReload() {
    setEditing(null);
    onSaved?.();
    onReload();
  }

  async function savePersonal() {
    const nextErrors = collectPersonalErrors(values);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      await employeeApi.update(employee.id, personalPayload(values));
      await finishAndReload();
    } catch (caught) {
      setActionError(caught instanceof ApiError ? caught.message : 'Не удалось сохранить');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveJob() {
    const nextErrors = collectJobErrors(values);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      await employeeApi.update(employee.id, jobPayload(values));
      await finishAndReload();
    } catch (caught) {
      setActionError(caught instanceof ApiError ? caught.message : 'Не удалось сохранить');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveExperience(index: number): Promise<boolean> {
    const item = values.workExperiences[index];
    const nextErrors: Record<string, string> = {};
    addExperienceFieldErrors(item, index, nextErrors);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return false;
    }
    setSavingKey(item.key);
    setActionError(null);
    try {
      const saved = item.id
        ? await employeeApi.updateWorkExperience(employee.id, item.id, experiencePayload(item))
        : await employeeApi.addWorkExperience(employee.id, experiencePayload(item));
      const workExperiences = [...values.workExperiences];
      workExperiences[index] = {
        ...item,
        id: saved.id,
        positionName: saved.positionName,
        countryName: saved.countryName,
        cityName: saved.cityName,
        view: true,
        expanded: true,
      };
      setField('workExperiences', workExperiences);
      onSaved?.();
      return true;
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось сохранить опыт работы',
      );
      return false;
    } finally {
      setSavingKey(null);
    }
  }

  async function saveEducation(index: number): Promise<boolean> {
    const item = values.educations[index];
    const nextErrors: Record<string, string> = {};
    addEducationFieldErrors(item, index, nextErrors);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return false;
    }
    setSavingKey(item.key);
    setActionError(null);
    try {
      const saved = item.id
        ? await employeeApi.updateEducation(employee.id, item.id, educationPayload(item))
        : await employeeApi.addEducation(employee.id, educationPayload(item));
      const educations = [...values.educations];
      educations[index] = {
        ...item,
        id: saved.id,
        educationLevelName: saved.educationLevelName,
        countryName: saved.countryName,
        cityName: saved.cityName,
        view: true,
        expanded: false,
      };
      setField('educations', educations);
      onSaved?.();
      return true;
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось сохранить образование',
      );
      return false;
    } finally {
      setSavingKey(null);
    }
  }

  async function saveRelative(index: number): Promise<boolean> {
    const item = values.relatives[index];
    const nextErrors: Record<string, string> = {};
    addRelativeFieldErrors(item, index, nextErrors);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return false;
    }
    setSavingKey(item.key);
    setActionError(null);
    try {
      const saved = item.id
        ? await employeeApi.updateRelative(employee.id, item.id, relativePayload(item))
        : await employeeApi.addRelative(employee.id, relativePayload(item));
      const relatives = [...values.relatives];
      relatives[index] = {
        ...item,
        id: saved.id,
        fullName: saved.fullName,
        relationshipType: saved.relationshipType,
        occupation: saved.occupation ?? '',
        birthDate: saved.birthDate?.toString().slice(0, 10) ?? item.birthDate,
        phone: saved.phone ?? '',
        view: true,
        expanded: false,
      };
      setField('relatives', relatives);
      onSaved?.();
      return true;
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось сохранить родственника',
      );
      return false;
    } finally {
      setSavingKey(null);
    }
  }

  async function deleteExperience(index: number) {
    const item = values.workExperiences[index];
    setActionError(null);
    try {
      if (item.id) {
        setSavingKey(item.key);
        await employeeApi.deleteWorkExperience(employee.id, item.id);
      }
      setField(
        'workExperiences',
        values.workExperiences.filter((_, itemIndex) => itemIndex !== index),
      );
      onSaved?.();
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось удалить опыт работы',
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function deleteEducation(index: number) {
    const item = values.educations[index];
    setActionError(null);
    try {
      if (item.id) {
        setSavingKey(item.key);
        await employeeApi.deleteEducation(employee.id, item.id);
      }
      setField(
        'educations',
        values.educations.filter((_, itemIndex) => itemIndex !== index),
      );
      onSaved?.();
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось удалить образование',
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function deleteRelative(index: number) {
    const item = values.relatives[index];
    setActionError(null);
    try {
      if (item.id) {
        setSavingKey(item.key);
        await employeeApi.deleteRelative(employee.id, item.id);
      }
      setField(
        'relatives',
        values.relatives.filter((_, itemIndex) => itemIndex !== index),
      );
      onSaved?.();
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось удалить родственника',
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function persistPendingAndClose(
    kind: 'experience' | 'education' | 'relatives',
  ) {
    const pendingIndexes =
      kind === 'experience'
        ? values.workExperiences
            .map((item, index) => (item.view ? -1 : index))
            .filter((index) => index >= 0)
        : kind === 'education'
          ? values.educations
              .map((item, index) => (item.view ? -1 : index))
              .filter((index) => index >= 0)
          : values.relatives
              .map((item, index) => (item.view ? -1 : index))
              .filter((index) => index >= 0);

    for (const index of pendingIndexes) {
      const saved =
        kind === 'experience'
          ? await saveExperience(index)
          : kind === 'education'
            ? await saveEducation(index)
            : await saveRelative(index);
      if (!saved) {
        return;
      }
    }

    await finishAndReload();
  }

  if (loading) {
    return <p className="text-sm text-ink-500">Загружаем справочники...</p>;
  }

  if (refsError) {
    return <p className="text-sm text-rose-600">{refsError}</p>;
  }

  function pencil(section: EmployeeDetailsSection) {
    if (editing === section) {
      return null;
    }
    return <SectionEditButton onClick={() => startEdit(section)} />;
  }

  return (
    <div className="space-y-4">
      {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}
      <EmployeeDetails
        employee={employee}
        sectionActions={{
          personal: pencil('personal'),
          job: pencil('job'),
          experience: pencil('experience'),
          education: pencil('education'),
          relatives: pencil('relatives'),
        }}
        sectionEditors={{
          personal:
            editing === 'personal' ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <DateField
                    label="Дата рождения"
                    max={BIRTH_DATE_MAX}
                    value={values.birthDate}
                    error={fieldErrors.birthDate}
                    onChange={(value) => setField('birthDate', value)}
                  />
                  <Input
                    label="ПИНФЛ"
                    inputMode="numeric"
                    maxLength={14}
                    value={values.pinfl}
                    error={fieldErrors.pinfl}
                    onChange={(event) => setField('pinfl', digitsOnly(event.target.value, 14))}
                  />
                  <Input
                    label="Серия паспорта"
                    maxLength={2}
                    value={values.passportSeries}
                    error={fieldErrors.passportSeries}
                    onChange={(event) =>
                      setField('passportSeries', lettersOnly(event.target.value, 2))
                    }
                  />
                  <Input
                    label="Номер паспорта"
                    inputMode="numeric"
                    maxLength={7}
                    value={values.passportNumber}
                    error={fieldErrors.passportNumber}
                    onChange={(event) =>
                      setField('passportNumber', digitsOnly(event.target.value, 7))
                    }
                  />
                  <DateField
                    label="Срок действия паспорта"
                    value={values.passportExpireDate}
                    error={fieldErrors.passportExpireDate}
                    invalidIfPast
                    onChange={(value) => setField('passportExpireDate', value)}
                  />
                  <Input
                    label="Кем выдан"
                    value={values.passportIssuedBy}
                    error={fieldErrors.passportIssuedBy}
                    onChange={(event) => setField('passportIssuedBy', event.target.value)}
                  />
                  <PhoneField
                    label="Телефон"
                    value={values.phone}
                    error={fieldErrors.phone}
                    onChange={(value) => setField('phone', value)}
                  />
                  <CountryCityFields
                    countryId={values.countryId}
                    cityId={values.cityId}
                    countries={options.countries}
                    cities={refs.cities}
                    countryError={fieldErrors.countryId}
                    cityError={fieldErrors.cityId}
                    onChange={({ countryId, cityId }) => {
                      setValues((current) => ({ ...current, countryId, cityId }));
                    }}
                  />
                  <Input
                    label="Адрес"
                    value={values.address}
                    error={fieldErrors.address}
                    onChange={(event) => setField('address', event.target.value)}
                  />
                  <Select
                    label="Пол"
                    value={values.genderId}
                    options={options.genders}
                    error={fieldErrors.genderId}
                    onChange={(event) => setField('genderId', event.target.value)}
                  />
                  <Select
                    label="Гражданство"
                    value={values.citizenshipId}
                    options={options.citizenships}
                    error={fieldErrors.citizenshipId}
                    onChange={(event) => setField('citizenshipId', event.target.value)}
                  />
                  <Select
                    label="Национальность"
                    value={values.nationalityId}
                    options={options.nationalities}
                    error={fieldErrors.nationalityId}
                    onChange={(event) => setField('nationalityId', event.target.value)}
                  />
                  <Select
                    label="Семейное положение"
                    value={values.maritalStatusId}
                    options={options.maritalStatuses}
                    error={fieldErrors.maritalStatusId}
                    onChange={(event) => setField('maritalStatusId', event.target.value)}
                  />
                </div>
                <SectionButtons
                  submitting={submitting}
                  onCancel={cancelEdit}
                  onSave={() => void savePersonal()}
                />
              </div>
            ) : undefined,
          job:
            editing === 'job' ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Табельный номер"
                    autoCapitalize="characters"
                    value={values.employeeNumber}
                    error={fieldErrors.employeeNumber}
                    onChange={(event) =>
                      setField('employeeNumber', event.target.value.toUpperCase())
                    }
                  />
                  <DateField
                    label="Дата приёма"
                    value={values.hireDate}
                    error={fieldErrors.hireDate}
                    onChange={(value) => setField('hireDate', value)}
                  />
                  <Select
                    label="Подразделение"
                    value={values.departmentId}
                    options={options.departments}
                    error={fieldErrors.departmentId}
                    onChange={(event) => setField('departmentId', event.target.value)}
                  />
                  <Select
                    label="Должность"
                    value={values.positionId}
                    options={options.positions}
                    error={fieldErrors.positionId}
                    onChange={(event) => setField('positionId', event.target.value)}
                  />
                  <div className="md:col-span-2">
                    <Select
                      label="Тип занятости"
                      value={values.employmentTypeId}
                      options={options.employmentTypes}
                      error={fieldErrors.employmentTypeId}
                      onChange={(event) => setField('employmentTypeId', event.target.value)}
                    />
                  </div>
                  <Select
                    label="Проходили военную службу?"
                    value={values.militaryService}
                    options={YES_NO_OPTIONS}
                    error={fieldErrors.militaryService}
                    onChange={(event) => setField('militaryService', event.target.value)}
                  />
                  <Select
                    label="Есть водительские права?"
                    value={values.hasDriverLicense}
                    options={YES_NO_OPTIONS}
                    error={fieldErrors.hasDriverLicense}
                    onChange={(event) => {
                      setField('hasDriverLicense', event.target.value);
                      if (event.target.value !== 'true') {
                        setField('driverLicenseCategoryId', '');
                      }
                    }}
                  />
                  {values.hasDriverLicense === 'true' ? (
                    <Select
                      label="Категория прав"
                      value={values.driverLicenseCategoryId}
                      options={options.driverLicenseCategories}
                      error={fieldErrors.driverLicenseCategoryId}
                      onChange={(event) =>
                        setField('driverLicenseCategoryId', event.target.value)
                      }
                    />
                  ) : null}
                  <div className="md:col-span-2">
                    <Input
                      label="Дополнительно"
                      value={values.additionalInfo}
                      onChange={(event) => setField('additionalInfo', event.target.value)}
                    />
                  </div>
                </div>
                <SectionButtons
                  submitting={submitting}
                  onCancel={cancelEdit}
                  onSave={() => void saveJob()}
                />
              </div>
            ) : undefined,
          experience:
            editing === 'experience' ? (
              <CollectionEditor
                submitting={Boolean(savingKey)}
                addLabel="Добавить опыт работы"
                onAdd={() => setField('workExperiences', [...values.workExperiences, emptyExperience()])}
                onCancel={cancelEdit}
                onDone={() => void persistPendingAndClose('experience')}
              >
                {values.workExperiences.map((item, index) => (
                  <ExperienceCard
                    key={item.key}
                    item={item}
                    index={index}
                    options={options.positions}
                    countries={options.countries}
                    cities={refs.cities}
                    errors={fieldErrors}
                    saving={savingKey === item.key}
                    onChange={(next) => {
                      const workExperiences = [...values.workExperiences];
                      workExperiences[index] = next;
                      setField('workExperiences', workExperiences);
                    }}
                    onSave={() => void saveExperience(index)}
                    onEdit={() => {
                      const workExperiences = [...values.workExperiences];
                      workExperiences[index] = { ...item, view: false };
                      setField('workExperiences', workExperiences);
                    }}
                    onDelete={() => void deleteExperience(index)}
                    onToggleExpand={() => {
                      const workExperiences = [...values.workExperiences];
                      workExperiences[index] = { ...item, expanded: !item.expanded };
                      setField('workExperiences', workExperiences);
                    }}
                  />
                ))}
              </CollectionEditor>
            ) : undefined,
          education:
            editing === 'education' ? (
              <CollectionEditor
                submitting={Boolean(savingKey)}
                addLabel="Добавить образование"
                onAdd={() => setField('educations', [...values.educations, emptyEducation()])}
                onCancel={cancelEdit}
                onDone={() => void persistPendingAndClose('education')}
              >
                {values.educations.map((item, index) => (
                  <EducationCard
                    key={item.key}
                    item={item}
                    index={index}
                    options={options.educationLevels}
                    countries={options.countries}
                    cities={refs.cities}
                    errors={fieldErrors}
                    saving={savingKey === item.key}
                    onChange={(next) => {
                      const educations = [...values.educations];
                      educations[index] = next;
                      setField('educations', educations);
                    }}
                    onSave={() => void saveEducation(index)}
                    onEdit={() => {
                      const educations = [...values.educations];
                      educations[index] = { ...item, view: false };
                      setField('educations', educations);
                    }}
                    onDelete={() => void deleteEducation(index)}
                    onToggleExpand={() => {
                      const educations = [...values.educations];
                      educations[index] = { ...item, expanded: !item.expanded };
                      setField('educations', educations);
                    }}
                  />
                ))}
              </CollectionEditor>
            ) : undefined,
          relatives:
            editing === 'relatives' ? (
              <CollectionEditor
                submitting={Boolean(savingKey)}
                addLabel="Добавить родственника"
                onAdd={() => setField('relatives', [...values.relatives, emptyRelative()])}
                onCancel={cancelEdit}
                onDone={() => void persistPendingAndClose('relatives')}
              >
                {values.relatives.map((item, index) => (
                  <RelativeCard
                    key={item.key}
                    item={item}
                    index={index}
                    errors={fieldErrors}
                    saving={savingKey === item.key}
                    onChange={(next) => {
                      const relatives = [...values.relatives];
                      relatives[index] = next;
                      setField('relatives', relatives);
                    }}
                    onSave={() => void saveRelative(index)}
                    onEdit={() => {
                      const relatives = [...values.relatives];
                      relatives[index] = { ...item, view: false };
                      setField('relatives', relatives);
                    }}
                    onDelete={() => void deleteRelative(index)}
                    onToggleExpand={() => {
                      const relatives = [...values.relatives];
                      relatives[index] = { ...item, expanded: !item.expanded };
                      setField('relatives', relatives);
                    }}
                  />
                ))}
              </CollectionEditor>
            ) : undefined,
        }}
      />
    </div>
  );
}

function SectionButtons({
  submitting,
  onCancel,
  onSave,
}: {
  submitting: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="secondary" disabled={submitting} onClick={onCancel}>
        Отмена
      </Button>
      <Button type="button" disabled={submitting} onClick={onSave}>
        {submitting ? 'Сохраняем...' : 'Сохранить'}
      </Button>
    </div>
  );
}

function CollectionEditor({
  children,
  addLabel,
  submitting,
  onAdd,
  onCancel,
  onDone,
}: {
  children: ReactNode;
  addLabel: string;
  submitting: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  return (
    <div className="space-y-4">
      {children}
      <Button type="button" variant="secondary" onClick={onAdd}>
        {addLabel}
      </Button>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" disabled={submitting} onClick={onCancel}>
          Отмена
        </Button>
        <Button type="button" disabled={submitting} onClick={onDone}>
          {submitting ? 'Сохраняем...' : 'Готово'}
        </Button>
      </div>
    </div>
  );
}
