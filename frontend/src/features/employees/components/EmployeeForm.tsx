import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button.tsx';
import { DateField } from '../../../components/ui/DateField.tsx';
import { PhoneField } from '../../../components/ui/PhoneField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Select } from '../../../components/ui/Select.tsx';
import { Stepper } from '../../../components/ui/Stepper.tsx';
import {
  BIRTH_DATE_MAX,
  digitsOnly,
  isBirthDateAllowed,
  isPassportNumber,
  isPassportSeries,
  isPinfl,
  isValidPhone,
  lettersOnly,
  required,
} from '../../../utils/validation.ts';
import { useReferences } from '../../references/hooks/useReferences.ts';
import type {
  CreateEmployeePayload,
  EducationItem,
  EmployeeDetails,
  WorkExperienceItem,
} from '../types/employee.ts';

const steps = [
  { title: 'Контакты', hint: 'Личные и паспортные данные' },
  { title: 'Работа', hint: 'Должность и стаж' },
  { title: 'Образование', hint: 'Учебные заведения' },
  { title: 'Опыт работы', hint: 'Предыдущие места работы' },
];

type FormValues = {
  birthDate: string;
  pinfl: string;
  passportSeries: string;
  passportNumber: string;
  passportExpireDate: string;
  passportIssuedBy: string;
  phone: string;
  address: string;
  employeeNumber: string;
  hireDate: string;
  genderId: string;
  citizenshipId: string;
  nationalityId: string;
  departmentId: string;
  positionId: string;
  employmentTypeId: string;
  educationLevelId: string;
  maritalStatusId: string;
  driverLicenseCategoryId: string;
  totalExperienceMonths: string;
  specialtyExperienceMonths: string;
  militaryService: boolean;
  hasDriverLicense: boolean;
  additionalInfo: string;
  educations: Array<Omit<EducationItem, 'id'>>;
  workExperiences: Array<Omit<WorkExperienceItem, 'id'>>;
};

type EmployeeFormProps = {
  accountId: number;
  employeeNumberHint: string;
  initial?: EmployeeDetails;
  submitting?: boolean;
  error?: string | null;
  onSaveStep: (step: number, payload: {
    employee: CreateEmployeePayload;
    educations: Array<Omit<EducationItem, 'id'>>;
    workExperiences: Array<Omit<WorkExperienceItem, 'id'>>;
  }) => Promise<boolean | void>;
};

function emptyEducation() {
  return { institutionName: '', specialty: '', graduationYear: new Date().getFullYear() };
}

function emptyExperience() {
  return {
    companyName: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    responsibilities: '',
  };
}

function fromInitial(
  hint: string,
  initial?: EmployeeDetails,
): FormValues {
  return {
    birthDate: initial?.birthDate?.toString().slice(0, 10) ?? '',
    pinfl: initial?.pinfl ?? '',
    passportSeries: initial?.passport.series ?? '',
    passportNumber: initial?.passport.number ?? '',
    passportExpireDate: initial?.passport.expireDate?.toString().slice(0, 10) ?? '',
    passportIssuedBy: initial?.passport.issuedBy ?? '',
    phone: initial?.contact.phone ?? '',
    address: initial?.contact.address ?? '',
    employeeNumber: initial?.employeeNumber ?? hint,
    hireDate: initial?.hireDate?.toString().slice(0, 10) ?? '',
    genderId: initial ? String(initial.gender.id) : '',
    citizenshipId: initial ? String(initial.citizenship.id) : '',
    nationalityId: initial ? String(initial.nationality.id) : '',
    departmentId: initial?.department ? String(initial.department.id) : '',
    positionId: initial?.position ? String(initial.position.id) : '',
    employmentTypeId: initial?.employmentType
      ? String(initial.employmentType.id)
      : '',
    educationLevelId: initial?.educationLevel
      ? String(initial.educationLevel.id)
      : '',
    maritalStatusId: initial ? String(initial.maritalStatus.id) : '',
    driverLicenseCategoryId: initial?.driverLicense.categoryId
      ? String(initial.driverLicense.categoryId)
      : '',
    totalExperienceMonths: String(initial?.experience.totalMonths ?? 0),
    specialtyExperienceMonths: String(initial?.experience.specialtyMonths ?? ''),
    militaryService: initial?.militaryService ?? false,
    hasDriverLicense: initial?.driverLicense.hasLicense ?? false,
    additionalInfo: initial?.additionalInfo ?? '',
    educations: initial?.education.length
      ? initial.education.map((item) => ({
          institutionName: item.institutionName,
          specialty: item.specialty,
          graduationYear: item.graduationYear,
        }))
      : [],
    workExperiences: initial?.workExperience.length
      ? initial.workExperience.map((item) => ({
          companyName: item.companyName,
          position: item.position,
          startDate: item.startDate?.toString().slice(0, 10) ?? '',
          endDate: item.endDate?.toString().slice(0, 10) ?? '',
          isCurrent: item.isCurrent,
          responsibilities: item.responsibilities ?? '',
        }))
      : [],
  };
}

export function EmployeeForm({
  accountId,
  employeeNumberHint,
  initial,
  submitting,
  error,
  onSaveStep,
}: EmployeeFormProps) {
  const { data: refs, loading, error: refsError } = useReferences();
  const [step, setStep] = useState(() => {
    if (!initial?.formStep || initial.formStep >= 4) {
      return 0;
    }
    return Math.min(initial.formStep, 3);
  });
  const [values, setValues] = useState<FormValues>(() =>
    fromInitial(employeeNumberHint, initial),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const options = useMemo(
    () => ({
      genders: refs.genders.map((item) => ({ value: item.id, label: item.name })),
      citizenships: refs.citizenships.map((item) => ({
        value: item.id,
        label: item.name,
      })),
      nationalities: refs.nationalities.map((item) => ({
        value: item.id,
        label: item.name,
      })),
      departments: refs.departments.map((item) => ({
        value: item.id,
        label: item.name,
      })),
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
    }),
    [refs],
  );

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function validateStep(current: number): boolean {
    const nextErrors: Record<string, string> = {};

    if (current === 0) {
      if (!required(values.birthDate)) {
        nextErrors.birthDate = 'Укажите дату рождения';
      } else if (!isBirthDateAllowed(values.birthDate)) {
        nextErrors.birthDate =
          'Сотрудник должен быть не моложе 16 лет (год рождения не позже 2010)';
      }
      if (!isPinfl(values.pinfl)) nextErrors.pinfl = 'ПИНФЛ — 14 цифр';
      if (!required(values.passportSeries)) {
        nextErrors.passportSeries = 'Обязательно';
      } else if (!isPassportSeries(values.passportSeries)) {
        nextErrors.passportSeries = 'Серия паспорта — 2 буквы';
      }
      if (!required(values.passportNumber)) {
        nextErrors.passportNumber = 'Обязательно';
      } else if (!isPassportNumber(values.passportNumber)) {
        nextErrors.passportNumber = 'Номер паспорта — до 7 цифр';
      }
      if (!required(values.passportExpireDate)) {
        nextErrors.passportExpireDate = 'Обязательно';
      }
      if (!required(values.passportIssuedBy)) nextErrors.passportIssuedBy = 'Обязательно';
      if (!required(values.phone)) {
        nextErrors.phone = 'Обязательно';
      } else if (!isValidPhone(values.phone)) {
        nextErrors.phone = 'Укажите корректный номер телефона';
      }
      if (!required(values.address)) nextErrors.address = 'Обязательно';
      if (!required(values.genderId)) nextErrors.genderId = 'Обязательно';
      if (!required(values.citizenshipId)) nextErrors.citizenshipId = 'Обязательно';
      if (!required(values.nationalityId)) nextErrors.nationalityId = 'Обязательно';
      if (!required(values.maritalStatusId)) nextErrors.maritalStatusId = 'Обязательно';
    }

    if (current === 1) {
      if (!required(values.employeeNumber)) nextErrors.employeeNumber = 'Обязательно';
      if (!required(values.hireDate)) nextErrors.hireDate = 'Обязательно';
      if (!required(values.departmentId)) nextErrors.departmentId = 'Обязательно';
      if (!required(values.positionId)) nextErrors.positionId = 'Обязательно';
      if (!required(values.employmentTypeId)) nextErrors.employmentTypeId = 'Обязательно';
      if (!required(values.educationLevelId)) nextErrors.educationLevelId = 'Обязательно';
    }

    if (current === 2) {
      values.educations.forEach((item, index) => {
        if (!item.institutionName.trim() || !item.specialty.trim()) {
          nextErrors[`education-${index}`] = 'Заполните учебное заведение и специальность';
        }
      });
    }

    if (current === 3) {
      values.workExperiences.forEach((item, index) => {
        if (!item.companyName.trim() || !item.position.trim() || !item.startDate) {
          nextErrors[`experience-${index}`] = 'Заполните организацию, должность и дату начала';
        }
      });
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildPayload() {
    const employee: CreateEmployeePayload = {
      accountId,
      birthDate: values.birthDate,
      pinfl: values.pinfl,
      passportSeries: values.passportSeries,
      passportNumber: values.passportNumber,
      passportExpireDate: values.passportExpireDate,
      passportIssuedBy: values.passportIssuedBy,
      phone: values.phone,
      address: values.address,
      employeeNumber: values.employeeNumber,
      hireDate: values.hireDate || undefined,
      genderId: Number(values.genderId),
      citizenshipId: Number(values.citizenshipId),
      nationalityId: Number(values.nationalityId),
      departmentId: values.departmentId ? Number(values.departmentId) : undefined,
      positionId: values.positionId ? Number(values.positionId) : undefined,
      employmentTypeId: values.employmentTypeId
        ? Number(values.employmentTypeId)
        : undefined,
      educationLevelId: values.educationLevelId
        ? Number(values.educationLevelId)
        : undefined,
      maritalStatusId: Number(values.maritalStatusId),
      driverLicenseCategoryId: values.hasDriverLicense
        ? Number(values.driverLicenseCategoryId) || undefined
        : undefined,
      totalExperienceMonths: Number(values.totalExperienceMonths || 0),
      specialtyExperienceMonths: values.specialtyExperienceMonths
        ? Number(values.specialtyExperienceMonths)
        : undefined,
      militaryService: values.militaryService,
      hasDriverLicense: values.hasDriverLicense,
      additionalInfo: values.additionalInfo || undefined,
    };

    return {
      employee,
      educations: values.educations,
      workExperiences: values.workExperiences.map((item) => ({
        ...item,
        endDate: item.isCurrent ? undefined : item.endDate || undefined,
        responsibilities: item.responsibilities || undefined,
      })),
    };
  }

  async function handleNext() {
    if (!validateStep(step)) {
      return;
    }

    const shouldAdvance = await onSaveStep(step, buildPayload());
    if (shouldAdvance === false) {
      return;
    }

    setStep((current) => current + 1);
  }

  async function handleSubmit() {
    if (!validateStep(step)) {
      return;
    }

    await onSaveStep(step, buildPayload());
  }

  if (loading) {
    return <p className="text-ink-500">Загружаем справочники...</p>;
  }

  if (refsError) {
    return <p className="text-rose-600">{refsError}</p>;
  }

  return (
    <div className="space-y-6">
      <Stepper steps={steps} current={step} />

      {step === 0 ? (
        <section className="grid gap-4 rounded-3xl border border-line bg-white p-4 md:grid-cols-2 md:p-6">
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
            onChange={(value) => {
              setField('phone', value);
              setFieldErrors((current) => ({ ...current, phone: '' }));
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
        </section>
      ) : null}

      {step === 1 ? (
        <section className="grid gap-4 rounded-3xl border border-line bg-white p-4 md:grid-cols-2 md:p-6">
          <Input
            label="Табельный номер"
            value={values.employeeNumber}
            error={fieldErrors.employeeNumber}
            onChange={(event) => setField('employeeNumber', event.target.value)}
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
          <Select
            label="Тип занятости"
            value={values.employmentTypeId}
            options={options.employmentTypes}
            error={fieldErrors.employmentTypeId}
            onChange={(event) => setField('employmentTypeId', event.target.value)}
          />
          <Select
            label="Уровень образования"
            value={values.educationLevelId}
            options={options.educationLevels}
            error={fieldErrors.educationLevelId}
            onChange={(event) => setField('educationLevelId', event.target.value)}
          />
          <Input
            label="Общий стаж, месяцы"
            type="number"
            min={0}
            value={values.totalExperienceMonths}
            onChange={(event) => setField('totalExperienceMonths', event.target.value)}
          />
          <Input
            label="Стаж по специальности, месяцы"
            type="number"
            min={0}
            value={values.specialtyExperienceMonths}
            onChange={(event) =>
              setField('specialtyExperienceMonths', event.target.value)
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.militaryService}
              onChange={(event) => setField('militaryService', event.target.checked)}
            />
            Военная служба
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.hasDriverLicense}
              onChange={(event) => setField('hasDriverLicense', event.target.checked)}
            />
            Водительские права
          </label>
          {values.hasDriverLicense ? (
            <Select
              label="Категория прав"
              value={values.driverLicenseCategoryId}
              options={options.driverLicenseCategories}
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
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4 rounded-3xl border border-line bg-white p-4 md:p-6">
          {values.educations.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-3">
              <Input
                label="Учебное заведение"
                value={item.institutionName}
                error={fieldErrors[`education-${index}`]}
                onChange={(event) => {
                  const educations = [...values.educations];
                  educations[index] = { ...item, institutionName: event.target.value };
                  setField('educations', educations);
                }}
              />
              <Input
                label="Специальность"
                value={item.specialty}
                onChange={(event) => {
                  const educations = [...values.educations];
                  educations[index] = { ...item, specialty: event.target.value };
                  setField('educations', educations);
                }}
              />
              <Input
                label="Год окончания"
                type="number"
                value={item.graduationYear}
                onChange={(event) => {
                  const educations = [...values.educations];
                  educations[index] = {
                    ...item,
                    graduationYear: Number(event.target.value),
                  };
                  setField('educations', educations);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setField(
                    'educations',
                    values.educations.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                Удалить
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setField('educations', [...values.educations, emptyEducation()])}
          >
            Добавить образование
          </Button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-4 rounded-3xl border border-line bg-white p-4 md:p-6">
          {values.workExperiences.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
              <Input
                label="Организация"
                value={item.companyName}
                error={fieldErrors[`experience-${index}`]}
                onChange={(event) => {
                  const workExperiences = [...values.workExperiences];
                  workExperiences[index] = { ...item, companyName: event.target.value };
                  setField('workExperiences', workExperiences);
                }}
              />
              <Input
                label="Должность"
                value={item.position}
                onChange={(event) => {
                  const workExperiences = [...values.workExperiences];
                  workExperiences[index] = { ...item, position: event.target.value };
                  setField('workExperiences', workExperiences);
                }}
              />
              <DateField
                label="Дата начала"
                value={item.startDate}
                onChange={(value) => {
                  const workExperiences = [...values.workExperiences];
                  workExperiences[index] = { ...item, startDate: value };
                  setField('workExperiences', workExperiences);
                }}
              />
              <DateField
                label="Дата окончания"
                value={item.endDate ?? ''}
                disabled={item.isCurrent}
                onChange={(value) => {
                  const workExperiences = [...values.workExperiences];
                  workExperiences[index] = { ...item, endDate: value };
                  setField('workExperiences', workExperiences);
                }}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.isCurrent}
                  onChange={(event) => {
                    const workExperiences = [...values.workExperiences];
                    workExperiences[index] = {
                      ...item,
                      isCurrent: event.target.checked,
                      endDate: event.target.checked ? '' : item.endDate,
                    };
                    setField('workExperiences', workExperiences);
                  }}
                />
                Текущее место работы
              </label>
              <Input
                label="Обязанности"
                value={item.responsibilities ?? ''}
                onChange={(event) => {
                  const workExperiences = [...values.workExperiences];
                  workExperiences[index] = {
                    ...item,
                    responsibilities: event.target.value,
                  };
                  setField('workExperiences', workExperiences);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setField(
                    'workExperiences',
                    values.workExperiences.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                Удалить
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setField('workExperiences', [...values.workExperiences, emptyExperience()])
            }
          >
            Добавить опыт работы
          </Button>
        </section>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="sticky bottom-0 z-10 -mx-4 flex justify-between gap-3 bg-page/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:bg-transparent md:px-0 md:py-0">
        <Button
          type="button"
          variant="secondary"
          className="flex-1 sm:flex-none"
          disabled={step === 0}
          onClick={() => setStep((current) => current - 1)}
        >
          Назад
        </Button>
        {step < steps.length - 1 ? (
          <Button
            type="button"
            className="flex-1 sm:flex-none"
            disabled={submitting}
            onClick={() => void handleNext()}
          >
            {submitting ? 'Сохраняем...' : 'Далее'}
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1 sm:flex-none"
            disabled={submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? 'Сохраняем...' : 'Сохранить анкету'}
          </Button>
        )}
      </div>
    </div>
  );
}
