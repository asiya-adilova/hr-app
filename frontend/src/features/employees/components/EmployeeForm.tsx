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
  todayIsoDate,
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
  { title: 'Работа', hint: 'Должность и условия работы' },
  { title: 'Опыт работы', hint: 'Предыдущие места работы' },
  { title: 'Образование', hint: 'Учебные заведения' },
  { title: 'Дополнительно', hint: 'Военная служба и права' },
];

const YES_NO_OPTIONS = [
  { value: 'true', label: 'Да' },
  { value: 'false', label: 'Нет' },
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
  maritalStatusId: string;
  driverLicenseCategoryId: string;
  militaryService: string;
  hasDriverLicense: string;
  additionalInfo: string;
  educations: EducationFormItem[];
  workExperiences: WorkExperienceFormItem[];
};

type EducationFormItem = {
  institutionName: string;
  specialty: string;
  educationLevelId: string;
  graduationYear: number;
};

type WorkExperienceFormItem = {
  companyName: string;
  positionId: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
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
  onComplete?: () => void;
};

function emptyEducation(): EducationFormItem {
  return {
    institutionName: '',
    specialty: '',
    educationLevelId: '',
    graduationYear: new Date().getFullYear(),
  };
}

function emptyExperience(): WorkExperienceFormItem {
  return {
    companyName: '',
    positionId: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    responsibilities: '',
  };
}

const DUPLICATE_EXPERIENCE_MESSAGE =
  'Нельзя указать один и тот же опыт работы несколько раз';

function experiencePeriod(item: WorkExperienceFormItem) {
  const company = item.companyName.trim().toLowerCase();
  const positionId = item.positionId.trim();
  const startDate = item.startDate.slice(0, 10);
  const endDate = item.isCurrent ? todayIsoDate() : (item.endDate ?? '').slice(0, 10);

  if (!company || !positionId || !startDate || !endDate || startDate > endDate) {
    return null;
  }

  return { company, positionId, startDate, endDate };
}

function periodsOverlap(
  first: { startDate: string; endDate: string },
  second: { startDate: string; endDate: string },
) {
  return first.startDate <= second.endDate && second.startDate <= first.endDate;
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
    maritalStatusId: initial ? String(initial.maritalStatus.id) : '',
    driverLicenseCategoryId: initial?.driverLicense.categoryId
      ? String(initial.driverLicense.categoryId)
      : '',
    militaryService: initial ? String(initial.militaryService) : '',
    hasDriverLicense: initial ? String(initial.driverLicense.hasLicense) : '',
    additionalInfo: initial?.additionalInfo ?? '',
    educations: initial?.education.length
      ? initial.education.map((item) => ({
          institutionName: item.institutionName,
          specialty: item.specialty,
          educationLevelId: item.educationLevelId ? String(item.educationLevelId) : '',
          graduationYear: item.graduationYear,
        }))
      : [],
    workExperiences: initial?.workExperience.length
      ? initial.workExperience.map((item) => ({
          companyName: item.companyName,
          positionId: item.positionId ? String(item.positionId) : '',
          startDate: item.startDate?.toString().slice(0, 10) ?? '',
          endDate: item.endDate?.toString().slice(0, 10) ?? '',
          isCurrent: item.isCurrent,
          responsibilities: item.responsibilities ?? '',
        }))
      : [],
  };
}

function cloneFormValues(values: FormValues): FormValues {
  return {
    ...values,
    educations: values.educations.map((item) => ({ ...item })),
    workExperiences: values.workExperiences.map((item) => ({ ...item })),
  };
}

function snapshotForStep(step: number, values: FormValues) {
  if (step === 0) {
    return {
      birthDate: values.birthDate,
      pinfl: values.pinfl,
      passportSeries: values.passportSeries,
      passportNumber: values.passportNumber,
      passportExpireDate: values.passportExpireDate,
      passportIssuedBy: values.passportIssuedBy,
      phone: values.phone,
      address: values.address,
      genderId: values.genderId,
      citizenshipId: values.citizenshipId,
      nationalityId: values.nationalityId,
      maritalStatusId: values.maritalStatusId,
    };
  }

  if (step === 1) {
    return {
      employeeNumber: values.employeeNumber,
      hireDate: values.hireDate,
      departmentId: values.departmentId,
      positionId: values.positionId,
      employmentTypeId: values.employmentTypeId,
    };
  }

  if (step === 2) {
    return {
      workExperiences: values.workExperiences.map((item) => ({
        companyName: item.companyName,
        positionId: item.positionId,
        startDate: item.startDate,
        endDate: item.isCurrent ? '' : (item.endDate ?? ''),
        isCurrent: item.isCurrent,
        responsibilities: (item.responsibilities ?? '').trim(),
      })),
    };
  }

  if (step === 3) {
    return {
      educations: values.educations.map((item) => ({
        institutionName: item.institutionName,
        specialty: item.specialty,
        educationLevelId: item.educationLevelId,
        graduationYear: item.graduationYear,
      })),
    };
  }

  return {
    militaryService: values.militaryService,
    hasDriverLicense: values.hasDriverLicense,
    driverLicenseCategoryId:
      values.hasDriverLicense === 'true' ? values.driverLicenseCategoryId : '',
    additionalInfo: values.additionalInfo,
  };
}

function isStepDirty(step: number, current: FormValues, saved: FormValues) {
  return (
    JSON.stringify(snapshotForStep(step, current)) !==
    JSON.stringify(snapshotForStep(step, saved))
  );
}

function initialMaxReached(formStep?: number) {
  if (!formStep) {
    return 0;
  }
  if (formStep >= 5) {
    return 4;
  }
  return Math.min(formStep, 4);
}

export function EmployeeForm({
  accountId,
  employeeNumberHint,
  initial,
  submitting,
  error,
  onSaveStep,
  onComplete,
}: EmployeeFormProps) {
  const { data: refs, loading, error: refsError } = useReferences();
  const [step, setStep] = useState(() => {
    if (!initial?.formStep || initial.formStep >= 5) {
      return 0;
    }
    return Math.min(initial.formStep, 4);
  });
  const [values, setValues] = useState<FormValues>(() =>
    fromInitial(employeeNumberHint, initial),
  );
  const [savedValues, setSavedValues] = useState<FormValues>(() =>
    fromInitial(employeeNumberHint, initial),
  );
  const [maxReached, setMaxReached] = useState(() =>
    initialMaxReached(initial?.formStep),
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

  function collectStepErrors(current: number) {
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
    }

    if (current === 2) {
      const overlappingIndexes = new Set<number>();
      const periods = values.workExperiences.map((item) => experiencePeriod(item));

      values.workExperiences.forEach((item, index) => {
        if (!item.companyName.trim()) {
          nextErrors[`experience-${index}-company`] = 'Обязательно';
        }
        if (!item.positionId) {
          nextErrors[`experience-${index}-position`] = 'Обязательно';
        }
        if (!item.startDate) {
          nextErrors[`experience-${index}-start`] = 'Обязательно';
        } else if (item.startDate > todayIsoDate()) {
          nextErrors[`experience-${index}-start`] = 'Дата начала не может быть в будущем';
        }
        if (!item.isCurrent && !item.endDate) {
          nextErrors[`experience-${index}-end`] = 'Обязательно';
        } else if (
          item.startDate &&
          !item.isCurrent &&
          item.endDate &&
          item.startDate > item.endDate
        ) {
          nextErrors[`experience-${index}-end`] =
            'Дата окончания не может быть раньше даты начала';
        }
        if (!item.responsibilities?.trim()) {
          nextErrors[`experience-${index}-responsibilities`] = 'Обязательно';
        }
      });

      for (let first = 0; first < periods.length; first += 1) {
        const firstPeriod = periods[first];
        if (!firstPeriod) {
          continue;
        }
        for (let second = first + 1; second < periods.length; second += 1) {
          const secondPeriod = periods[second];
          if (!secondPeriod) {
            continue;
          }
          if (
            firstPeriod.company === secondPeriod.company &&
            firstPeriod.positionId === secondPeriod.positionId &&
            periodsOverlap(firstPeriod, secondPeriod)
          ) {
            overlappingIndexes.add(first);
            overlappingIndexes.add(second);
          }
        }
      }

      for (const index of overlappingIndexes) {
        nextErrors[`experience-${index}-duplicate`] = DUPLICATE_EXPERIENCE_MESSAGE;
      }
    }

    if (current === 3) {
      values.educations.forEach((item, index) => {
        if (!item.institutionName.trim()) {
          nextErrors[`education-${index}-institution`] = 'Обязательно';
        }
        if (!item.specialty.trim()) {
          nextErrors[`education-${index}-specialty`] = 'Обязательно';
        }
        if (!item.educationLevelId) {
          nextErrors[`education-${index}-level`] = 'Обязательно';
        }
        if (!item.graduationYear) {
          nextErrors[`education-${index}-year`] = 'Обязательно';
        }
      });
    }

    if (current === 4) {
      if (!required(values.militaryService)) nextErrors.militaryService = 'Обязательно';
      if (!required(values.hasDriverLicense)) nextErrors.hasDriverLicense = 'Обязательно';
      if (values.hasDriverLicense === 'true' && !required(values.driverLicenseCategoryId)) {
        nextErrors.driverLicenseCategoryId = 'Обязательно';
      }
    }

    return nextErrors;
  }

  function isStepValid(current: number) {
    return Object.keys(collectStepErrors(current)).length === 0;
  }

  function validateStep(current: number): boolean {
    const nextErrors = collectStepErrors(current);
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
      maritalStatusId: Number(values.maritalStatusId),
      driverLicenseCategoryId: values.hasDriverLicense === 'true'
        ? Number(values.driverLicenseCategoryId) || undefined
        : undefined,
      militaryService: values.militaryService === 'true',
      hasDriverLicense: values.hasDriverLicense === 'true',
      additionalInfo: values.additionalInfo || undefined,
    };

    return {
      employee,
      educations: values.educations.map((item) => ({
        institutionName: item.institutionName,
        specialty: item.specialty,
        educationLevelId: Number(item.educationLevelId),
        graduationYear: Number(item.graduationYear),
      })),
      workExperiences: values.workExperiences.map((item) => ({
        companyName: item.companyName,
        positionId: Number(item.positionId),
        startDate: item.startDate,
        endDate: item.isCurrent ? undefined : item.endDate || undefined,
        isCurrent: item.isCurrent,
        responsibilities: (item.responsibilities ?? '').trim(),
      })),
    };
  }

  async function persistCurrentStep() {
    if (!validateStep(step)) {
      return false;
    }

    if (isStepDirty(step, values, savedValues)) {
      const shouldAdvance = await onSaveStep(step, buildPayload());
      if (shouldAdvance === false) {
        return false;
      }
      setSavedValues(cloneFormValues(values));
    }

    setMaxReached((max) => Math.max(max, Math.min(step + 1, steps.length - 1)));
    return true;
  }

  async function handleNext() {
    const saved = await persistCurrentStep();
    if (!saved) {
      return;
    }

    setStep((current) => current + 1);
  }

  async function handleSubmit() {
    const saved = await persistCurrentStep();
    if (!saved) {
      return;
    }

    onComplete?.();
  }

  async function handleSelectStep(index: number) {
    if (index === step || submitting) {
      return;
    }

    if (index < step) {
      setFieldErrors({});
      setStep(index);
      return;
    }

    const saved = await persistCurrentStep();
    if (!saved) {
      return;
    }

    setStep(index);
  }

  if (loading) {
    return <p className="text-ink-500">Загружаем справочники...</p>;
  }

  if (refsError) {
    return <p className="text-rose-600">{refsError}</p>;
  }

  return (
    <div className="space-y-6">
      <Stepper
        steps={steps}
        current={step}
        maxReached={maxReached}
        canAdvance={isStepValid(step)}
        onSelect={(index) => void handleSelectStep(index)}
      />

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
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-4 rounded-3xl border border-line bg-white p-4 md:p-6">
          {values.educations.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
              <Input
                label="Учебное заведение"
                value={item.institutionName}
                error={fieldErrors[`education-${index}-institution`]}
                onChange={(event) => {
                  const educations = [...values.educations];
                  educations[index] = { ...item, institutionName: event.target.value };
                  setField('educations', educations);
                }}
              />
              <Input
                label="Специальность"
                value={item.specialty}
                error={fieldErrors[`education-${index}-specialty`]}
                onChange={(event) => {
                  const educations = [...values.educations];
                  educations[index] = { ...item, specialty: event.target.value };
                  setField('educations', educations);
                }}
              />
              <Select
                label="Уровень образования"
                value={item.educationLevelId}
                options={options.educationLevels}
                error={fieldErrors[`education-${index}-level`]}
                onChange={(event) => {
                  const educations = [...values.educations];
                  educations[index] = { ...item, educationLevelId: event.target.value };
                  setField('educations', educations);
                }}
              />
              <Input
                label="Год окончания"
                type="number"
                value={item.graduationYear}
                error={fieldErrors[`education-${index}-year`]}
                onChange={(event) => {
                  const educations = [...values.educations];
                  educations[index] = {
                    ...item,
                    graduationYear: Number(event.target.value),
                  };
                  setField('educations', educations);
                }}
              />
              <div className="flex justify-end md:col-span-2">
                <DeleteCardButton
                  onClick={() =>
                    setField(
                      'educations',
                      values.educations.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                />
              </div>
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

      {step === 2 ? (
        <section className="space-y-4 rounded-3xl border border-line bg-white p-4 md:p-6">
          {values.workExperiences.map((item, index) => (
            <div
              key={index}
              className={`grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-2 md:p-5 ${
                fieldErrors[`experience-${index}-duplicate`]
                  ? 'ring-1 ring-rose-400'
                  : ''
              }`}
            >
              <Input
                label="Организация"
                value={item.companyName}
                error={fieldErrors[`experience-${index}-company`]}
                onChange={(event) => {
                  const workExperiences = [...values.workExperiences];
                  workExperiences[index] = { ...item, companyName: event.target.value };
                  setField('workExperiences', workExperiences);
                }}
              />
              <Select
                label="Должность"
                value={item.positionId}
                options={options.positions}
                error={fieldErrors[`experience-${index}-position`]}
                onChange={(event) => {
                  const workExperiences = [...values.workExperiences];
                  workExperiences[index] = { ...item, positionId: event.target.value };
                  setField('workExperiences', workExperiences);
                }}
              />
              <DateField
                label="Дата начала"
                value={item.startDate}
                max={todayIsoDate()}
                error={fieldErrors[`experience-${index}-start`]}
                onChange={(value) => {
                  const workExperiences = [...values.workExperiences];
                  workExperiences[index] = { ...item, startDate: value };
                  setField('workExperiences', workExperiences);
                }}
              />
              <div className="space-y-3">
                <DateField
                  label="Дата окончания"
                  value={item.endDate ?? ''}
                  disabled={item.isCurrent}
                  error={fieldErrors[`experience-${index}-end`]}
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
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Обязанности"
                  value={item.responsibilities ?? ''}
                  error={fieldErrors[`experience-${index}-responsibilities`]}
                  onChange={(event) => {
                    const workExperiences = [...values.workExperiences];
                    workExperiences[index] = {
                      ...item,
                      responsibilities: event.target.value,
                    };
                    setField('workExperiences', workExperiences);
                  }}
                />
              </div>
              {fieldErrors[`experience-${index}-duplicate`] ? (
                <p className="text-xs text-rose-600 md:col-span-2">
                  {fieldErrors[`experience-${index}-duplicate`]}
                </p>
              ) : null}
              <div className="flex justify-end md:col-span-2">
                <DeleteCardButton
                  onClick={() =>
                    setField(
                      'workExperiences',
                      values.workExperiences.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                />
              </div>
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

      {step === 4 ? (
        <section className="grid gap-4 rounded-3xl border border-line bg-white p-4 md:grid-cols-2 md:p-6">
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

function DeleteCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50"
      aria-label="Удалить"
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 7h16" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}
