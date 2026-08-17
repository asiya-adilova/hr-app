import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button.tsx';
import { DateField } from '../../../components/ui/DateField.tsx';
import { PhoneField } from '../../../components/ui/PhoneField.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Select } from '../../../components/ui/Select.tsx';
import { Stepper } from '../../../components/ui/Stepper.tsx';
import { ApiError } from '../../../services/api-client.ts';
import {
  ADDITIONAL_INFO_MAX_LENGTH,
  ADDRESS_MAX_LENGTH,
  BIRTH_DATE_MAX,
  digitsOnly,
  isBirthDateAllowed,
  isPassportNumber,
  isPassportSeries,
  isPinfl,
  isValidPhone,
  lettersOnly,
  required,
  RESPONSIBILITIES_MAX_LENGTH,
  todayIsoDate,
} from '../../../utils/validation.ts';
import { useReferences } from '../../references/hooks/useReferences.ts';
import { employeeApi } from '../api/employee.api.ts';
import type {
  CreateEmployeePayload,
  EducationItem,
  EmployeeDetails,
  WorkExperienceItem,
} from '../types/employee.ts';
import { EducationCard, type EducationCardItem } from './EducationCard.tsx';
import { ExperienceCard, type ExperienceCardItem } from './ExperienceCard.tsx';
import { RelativeCard, type RelativeCardItem } from './RelativeCard.tsx';
import { CountryCityFields } from './CountryCityFields.tsx';

const steps = [
  { title: 'Контакты', hint: 'Личные и паспортные данные' },
  { title: 'Работа', hint: 'Должность и условия работы' },
  { title: 'Опыт работы', hint: 'Предыдущие места работы' },
  { title: 'Образование', hint: 'Учебные заведения' },
  { title: 'Дополнительно', hint: 'Военная служба, права и родственники' },
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
  countryId: string;
  cityId: string;
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
  educations: EducationCardItem[];
  workExperiences: ExperienceCardItem[];
  relatives: RelativeCardItem[];
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

function nextItemKey() {
  return `item-${crypto.randomUUID()}`;
}

function emptyEducation(): EducationCardItem {
  return {
    key: nextItemKey(),
    institutionName: '',
    specialty: '',
    educationLevelId: '',
    countryId: '',
    cityId: '',
    graduationYear: new Date().getFullYear(),
    view: false,
    expanded: false,
  };
}

function emptyExperience(): ExperienceCardItem {
  return {
    key: nextItemKey(),
    companyName: '',
    positionId: '',
    countryId: '',
    cityId: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    responsibilities: '',
    view: false,
    expanded: false,
  };
}

function emptyRelative(): RelativeCardItem {
  return {
    key: nextItemKey(),
    fullName: '',
    relationshipType: '',
    occupation: '',
    birthDate: '',
    phone: '',
    view: false,
    expanded: false,
  };
}

const DUPLICATE_EXPERIENCE_MESSAGE =
  'Нельзя указать один и тот же опыт работы несколько раз';

function experiencePeriod(item: ExperienceCardItem) {
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
    countryId: initial?.contact.country ? String(initial.contact.country.id) : '',
    cityId: initial?.contact.city ? String(initial.contact.city.id) : '',
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
          key: item.id ? `education-${item.id}` : nextItemKey(),
          id: item.id,
          institutionName: item.institutionName,
          specialty: item.specialty,
          educationLevelId: item.educationLevelId ? String(item.educationLevelId) : '',
          educationLevelName: item.educationLevelName,
          countryId: item.countryId ? String(item.countryId) : '',
          countryName: item.countryName,
          cityId: item.cityId ? String(item.cityId) : '',
          cityName: item.cityName,
          graduationYear: item.graduationYear,
          view: Boolean(item.id),
          expanded: false,
        }))
      : [],
    workExperiences: initial?.workExperience.length
      ? initial.workExperience.map((item) => ({
          key: item.id ? `experience-${item.id}` : nextItemKey(),
          id: item.id,
          companyName: item.companyName,
          positionId: item.positionId ? String(item.positionId) : '',
          positionName: item.positionName,
          countryId: item.countryId ? String(item.countryId) : '',
          countryName: item.countryName,
          cityId: item.cityId ? String(item.cityId) : '',
          cityName: item.cityName,
          startDate: item.startDate?.toString().slice(0, 10) ?? '',
          endDate: item.endDate?.toString().slice(0, 10) ?? '',
          isCurrent: item.isCurrent,
          responsibilities: item.responsibilities ?? '',
          view: Boolean(item.id),
          expanded: false,
        }))
      : [],
    relatives: initial?.relatives?.length
      ? initial.relatives.map((item) => ({
          key: item.id ? `relative-${item.id}` : nextItemKey(),
          id: item.id,
          fullName: item.fullName,
          relationshipType: item.relationshipType,
          occupation: item.occupation ?? '',
          birthDate: item.birthDate?.toString().slice(0, 10) ?? '',
          phone: item.phone ?? '',
          view: Boolean(item.id),
          expanded: false,
        }))
      : [],
  };
}

function cloneFormValues(values: FormValues): FormValues {
  return {
    ...values,
    educations: values.educations.map((item) => ({ ...item })),
    workExperiences: values.workExperiences.map((item) => ({ ...item })),
    relatives: values.relatives.map((item) => ({ ...item })),
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
      countryId: values.countryId,
      cityId: values.cityId,
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
        id: item.id ?? null,
        view: item.view,
      })),
    };
  }

  if (step === 3) {
    return {
      educations: values.educations.map((item) => ({
        id: item.id ?? null,
        view: item.view,
      })),
    };
  }

  return {
    militaryService: values.militaryService,
    hasDriverLicense: values.hasDriverLicense,
    driverLicenseCategoryId:
      values.hasDriverLicense === 'true' ? values.driverLicenseCategoryId : '',
    additionalInfo: values.additionalInfo,
    relatives: values.relatives.map((item) => ({
      id: item.id ?? null,
      view: item.view,
    })),
  };
}

function isStepDirty(step: number, current: FormValues, saved: FormValues) {
  return (
    JSON.stringify(snapshotForStep(step, current)) !==
    JSON.stringify(snapshotForStep(step, saved))
  );
}

function addExperienceFieldErrors(
  item: ExperienceCardItem,
  index: number,
  nextErrors: Record<string, string>,
) {
  if (!item.companyName.trim()) {
    nextErrors[`experience-${index}-company`] = 'Обязательно';
  }
  if (!item.positionId) {
    nextErrors[`experience-${index}-position`] = 'Обязательно';
  }
  if (!item.countryId) {
    nextErrors[`experience-${index}-country`] = 'Обязательно';
  }
  if (!item.cityId) {
    nextErrors[`experience-${index}-city`] = 'Обязательно';
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
  } else if (item.responsibilities.length > RESPONSIBILITIES_MAX_LENGTH) {
    nextErrors[`experience-${index}-responsibilities`] =
      `Максимум ${RESPONSIBILITIES_MAX_LENGTH} символов`;
  }
}

function addExperienceOverlapErrors(
  items: ExperienceCardItem[],
  nextErrors: Record<string, string>,
) {
  const overlappingIndexes = new Set<number>();
  const periods = items.map((item) => experiencePeriod(item));

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

function addEducationFieldErrors(
  item: EducationCardItem,
  index: number,
  nextErrors: Record<string, string>,
) {
  if (!item.institutionName.trim()) {
    nextErrors[`education-${index}-institution`] = 'Обязательно';
  }
  if (!item.specialty.trim()) {
    nextErrors[`education-${index}-specialty`] = 'Обязательно';
  }
  if (!item.educationLevelId) {
    nextErrors[`education-${index}-level`] = 'Обязательно';
  }
  if (!item.countryId) {
    nextErrors[`education-${index}-country`] = 'Обязательно';
  }
  if (!item.cityId) {
    nextErrors[`education-${index}-city`] = 'Обязательно';
  }
  if (!item.graduationYear) {
    nextErrors[`education-${index}-year`] = 'Обязательно';
  }
}

const DUPLICATE_RELATIVE_MESSAGE =
  'Родственник с такими данными уже существует';

function addRelativeFieldErrors(
  item: RelativeCardItem,
  index: number,
  nextErrors: Record<string, string>,
) {
  if (!item.fullName.trim()) {
    nextErrors[`relative-${index}-name`] = 'Обязательно';
  }
  if (!item.relationshipType) {
    nextErrors[`relative-${index}-relationship`] = 'Обязательно';
  }
  if (!item.occupation.trim()) {
    nextErrors[`relative-${index}-occupation`] = 'Обязательно';
  }
  if (!item.birthDate) {
    nextErrors[`relative-${index}-birthDate`] = 'Обязательно';
  } else if (item.birthDate > todayIsoDate()) {
    nextErrors[`relative-${index}-birthDate`] = 'Дата рождения не может быть в будущем';
  }
  if (!item.phone) {
    nextErrors[`relative-${index}-phone`] = 'Обязательно';
  } else if (!isValidPhone(item.phone)) {
    nextErrors[`relative-${index}-phone`] = 'Укажите корректный номер телефона';
  }
}

function addRelativeDuplicateErrors(
  items: RelativeCardItem[],
  nextErrors: Record<string, string>,
) {
  const seen = new Map<string, number>();

  items.forEach((item, index) => {
    const key = `${item.fullName.trim().toLowerCase()}|${item.relationshipType}`;
    if (!item.fullName.trim() || !item.relationshipType) {
      return;
    }
    const firstIndex = seen.get(key);
    if (firstIndex !== undefined) {
      nextErrors[`relative-${firstIndex}-duplicate`] = DUPLICATE_RELATIVE_MESSAGE;
      nextErrors[`relative-${index}-duplicate`] = DUPLICATE_RELATIVE_MESSAGE;
      return;
    }
    seen.set(key, index);
  });
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
  const [savedFormStep, setSavedFormStep] = useState(initial?.formStep ?? 0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
      countries: refs.countries.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    }),
    [refs],
  );

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function patchExperience(index: number, item: ExperienceCardItem) {
    const workExperiences = [...values.workExperiences];
    workExperiences[index] = item;
    setField('workExperiences', workExperiences);
  }

  function patchEducation(index: number, item: EducationCardItem) {
    const educations = [...values.educations];
    educations[index] = item;
    setField('educations', educations);
  }

  function patchRelative(index: number, item: RelativeCardItem) {
    const relatives = [...values.relatives];
    relatives[index] = item;
    setField('relatives', relatives);
  }

  function experiencePayload(item: ExperienceCardItem) {
    return {
      companyName: item.companyName,
      positionId: Number(item.positionId),
      countryId: Number(item.countryId),
      cityId: Number(item.cityId),
      startDate: item.startDate,
      endDate: item.isCurrent ? undefined : item.endDate || undefined,
      isCurrent: item.isCurrent,
      responsibilities: item.responsibilities.trim(),
    };
  }

  function educationPayload(item: EducationCardItem) {
    return {
      institutionName: item.institutionName,
      specialty: item.specialty,
      educationLevelId: Number(item.educationLevelId),
      countryId: Number(item.countryId),
      cityId: Number(item.cityId),
      graduationYear: Number(item.graduationYear),
    };
  }

  function relativePayload(item: RelativeCardItem) {
    return {
      fullName: item.fullName.trim(),
      relationshipType: item.relationshipType,
      occupation: item.occupation.trim(),
      birthDate: item.birthDate,
      phone: item.phone,
    };
  }

  async function commitExperienceItem(
    employeeId: number,
    item: ExperienceCardItem,
  ): Promise<ExperienceCardItem> {
    const committed = savedValues.workExperiences.find((entry) => entry.key === item.key);
    const unchanged =
      Boolean(item.id) &&
      committed &&
      JSON.stringify(experiencePayload(item)) === JSON.stringify(experiencePayload(committed));

    if (unchanged) {
      return { ...item, view: true, expanded: false };
    }

    const saved = item.id
      ? await employeeApi.updateWorkExperience(employeeId, item.id, experiencePayload(item))
      : await employeeApi.addWorkExperience(employeeId, experiencePayload(item));

    return {
      ...item,
      id: saved.id,
      positionName: saved.positionName,
      countryName: saved.countryName,
      cityName: saved.cityName,
      view: true,
      expanded: false,
    };
  }

  async function commitEducationItem(
    employeeId: number,
    item: EducationCardItem,
  ): Promise<EducationCardItem> {
    const committed = savedValues.educations.find((entry) => entry.key === item.key);
    const unchanged =
      Boolean(item.id) &&
      committed &&
      JSON.stringify(educationPayload(item)) === JSON.stringify(educationPayload(committed));

    if (unchanged) {
      return { ...item, view: true, expanded: false };
    }

    const saved = item.id
      ? await employeeApi.updateEducation(employeeId, item.id, educationPayload(item))
      : await employeeApi.addEducation(employeeId, educationPayload(item));

    return {
      ...item,
      id: saved.id,
      educationLevelName: saved.educationLevelName,
      countryName: saved.countryName,
      cityName: saved.cityName,
      view: true,
      expanded: false,
    };
  }

  async function persistPendingExperiences(): Promise<ExperienceCardItem[] | null> {
    const employeeId = initial?.id;
    if (!employeeId) {
      setActionError('Сначала сохраните контактные данные');
      return null;
    }

    let workExperiences = [...values.workExperiences];
    setActionError(null);
    try {
      for (let index = 0; index < workExperiences.length; index += 1) {
        const item = workExperiences[index];
        if (item.view) {
          continue;
        }
        setSavingKey(item.key);
        workExperiences[index] = await commitExperienceItem(employeeId, item);
      }
      setField('workExperiences', workExperiences);
      return workExperiences;
    } catch (caught) {
      setField('workExperiences', workExperiences);
      setSavedValues(cloneFormValues({ ...values, workExperiences }));
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось сохранить опыт работы',
      );
      return null;
    } finally {
      setSavingKey(null);
    }
  }

  async function persistPendingEducations(): Promise<EducationCardItem[] | null> {
    const employeeId = initial?.id;
    if (!employeeId) {
      setActionError('Сначала сохраните контактные данные');
      return null;
    }

    let educations = [...values.educations];
    setActionError(null);
    try {
      for (let index = 0; index < educations.length; index += 1) {
        const item = educations[index];
        if (item.view) {
          continue;
        }
        setSavingKey(item.key);
        educations[index] = await commitEducationItem(employeeId, item);
      }
      setField('educations', educations);
      return educations;
    } catch (caught) {
      setField('educations', educations);
      setSavedValues(cloneFormValues({ ...values, educations }));
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось сохранить образование',
      );
      return null;
    } finally {
      setSavingKey(null);
    }
  }

  async function commitRelativeItem(
    employeeId: number,
    item: RelativeCardItem,
  ): Promise<RelativeCardItem> {
    const committed = savedValues.relatives.find((entry) => entry.key === item.key);
    const unchanged =
      Boolean(item.id) &&
      committed &&
      JSON.stringify(relativePayload(item)) === JSON.stringify(relativePayload(committed));

    if (unchanged) {
      return { ...item, view: true, expanded: false };
    }

    const saved = item.id
      ? await employeeApi.updateRelative(employeeId, item.id, relativePayload(item))
      : await employeeApi.addRelative(employeeId, relativePayload(item));

    return {
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
  }

  async function persistPendingRelatives(): Promise<RelativeCardItem[] | null> {
    const employeeId = initial?.id;
    if (!employeeId) {
      setActionError('Сначала сохраните контактные данные');
      return null;
    }

    let relatives = [...values.relatives];
    setActionError(null);
    try {
      for (let index = 0; index < relatives.length; index += 1) {
        const item = relatives[index];
        if (item.view) {
          continue;
        }
        setSavingKey(item.key);
        relatives[index] = await commitRelativeItem(employeeId, item);
      }
      setField('relatives', relatives);
      return relatives;
    } catch (caught) {
      setField('relatives', relatives);
      setSavedValues(cloneFormValues({ ...values, relatives }));
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось сохранить родственника',
      );
      return null;
    } finally {
      setSavingKey(null);
    }
  }

  async function saveExperience(index: number) {
    const item = values.workExperiences[index];
    const employeeId = initial?.id;
    const nextErrors: Record<string, string> = {};
    addExperienceFieldErrors(item, index, nextErrors);
    addExperienceOverlapErrors(values.workExperiences, nextErrors);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !employeeId) {
      if (!employeeId) {
        setActionError('Сначала сохраните контактные данные');
      }
      return;
    }

    setSavingKey(item.key);
    setActionError(null);
    try {
      const workExperiences = [...values.workExperiences];
      workExperiences[index] = await commitExperienceItem(employeeId, item);
      setField('workExperiences', workExperiences);
      setSavedValues(cloneFormValues({ ...values, workExperiences }));
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось сохранить опыт работы',
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function saveEducation(index: number) {
    const item = values.educations[index];
    const employeeId = initial?.id;
    const nextErrors: Record<string, string> = {};
    addEducationFieldErrors(item, index, nextErrors);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !employeeId) {
      if (!employeeId) {
        setActionError('Сначала сохраните контактные данные');
      }
      return;
    }

    setSavingKey(item.key);
    setActionError(null);
    try {
      const educations = [...values.educations];
      educations[index] = await commitEducationItem(employeeId, item);
      setField('educations', educations);
      setSavedValues(cloneFormValues({ ...values, educations }));
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось сохранить образование',
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function saveRelative(index: number) {
    const item = values.relatives[index];
    const employeeId = initial?.id;
    const nextErrors: Record<string, string> = {};
    addRelativeFieldErrors(item, index, nextErrors);
    addRelativeDuplicateErrors(values.relatives, nextErrors);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !employeeId) {
      if (!employeeId) {
        setActionError('Сначала сохраните контактные данные');
      }
      return;
    }

    setSavingKey(item.key);
    setActionError(null);
    try {
      const relatives = [...values.relatives];
      relatives[index] = await commitRelativeItem(employeeId, item);
      setField('relatives', relatives);
      setSavedValues(cloneFormValues({ ...values, relatives }));
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось сохранить родственника',
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function deleteExperience(index: number) {
    const item = values.workExperiences[index];
    const employeeId = initial?.id;
    setActionError(null);
    try {
      if (item.id && employeeId) {
        setSavingKey(item.key);
        await employeeApi.deleteWorkExperience(employeeId, item.id);
      }
      const workExperiences = values.workExperiences.filter((_, itemIndex) => itemIndex !== index);
      setField('workExperiences', workExperiences);
      setSavedValues(cloneFormValues({ ...values, workExperiences }));
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
    const employeeId = initial?.id;
    setActionError(null);
    try {
      if (item.id && employeeId) {
        setSavingKey(item.key);
        await employeeApi.deleteEducation(employeeId, item.id);
      }
      const educations = values.educations.filter((_, itemIndex) => itemIndex !== index);
      setField('educations', educations);
      setSavedValues(cloneFormValues({ ...values, educations }));
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
    const employeeId = initial?.id;
    setActionError(null);
    try {
      if (item.id && employeeId) {
        setSavingKey(item.key);
        await employeeApi.deleteRelative(employeeId, item.id);
      }
      const relatives = values.relatives.filter((_, itemIndex) => itemIndex !== index);
      setField('relatives', relatives);
      setSavedValues(cloneFormValues({ ...values, relatives }));
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : 'Не удалось удалить родственника',
      );
    } finally {
      setSavingKey(null);
    }
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
      } else if (
        values.birthDate &&
        values.passportExpireDate < values.birthDate
      ) {
        nextErrors.passportExpireDate =
          'Срок действия паспорта не может быть раньше даты рождения';
      }
      if (!required(values.passportIssuedBy)) nextErrors.passportIssuedBy = 'Обязательно';
      if (!required(values.phone)) {
        nextErrors.phone = 'Обязательно';
      } else       if (!isValidPhone(values.phone)) {
        nextErrors.phone = 'Укажите корректный номер телефона';
      }
      if (!required(values.countryId)) nextErrors.countryId = 'Обязательно';
      if (!required(values.cityId)) nextErrors.cityId = 'Обязательно';
      if (!required(values.address)) {
        nextErrors.address = 'Обязательно';
      } else if (values.address.length > ADDRESS_MAX_LENGTH) {
        nextErrors.address = `Максимум ${ADDRESS_MAX_LENGTH} символов`;
      }
      if (!required(values.genderId)) nextErrors.genderId = 'Обязательно';
      if (!required(values.citizenshipId)) nextErrors.citizenshipId = 'Обязательно';
      if (!required(values.nationalityId)) nextErrors.nationalityId = 'Обязательно';
      if (!required(values.maritalStatusId)) nextErrors.maritalStatusId = 'Обязательно';
    }

    if (current === 1) {
      if (!required(values.employeeNumber)) nextErrors.employeeNumber = 'Обязательно';
      if (!required(values.hireDate)) {
        nextErrors.hireDate = 'Обязательно';
      } else if (values.birthDate && values.hireDate < values.birthDate) {
        nextErrors.hireDate = 'Дата приёма не может быть раньше даты рождения';
      }
      if (!required(values.departmentId)) nextErrors.departmentId = 'Обязательно';
      if (!required(values.positionId)) nextErrors.positionId = 'Обязательно';
      if (!required(values.employmentTypeId)) nextErrors.employmentTypeId = 'Обязательно';
    }

    if (current === 2) {
      values.workExperiences.forEach((item, index) => {
        if (!item.view) {
          addExperienceFieldErrors(item, index, nextErrors);
        }
      });
      addExperienceOverlapErrors(values.workExperiences, nextErrors);
    }

    if (current === 3) {
      values.educations.forEach((item, index) => {
        if (!item.view) {
          addEducationFieldErrors(item, index, nextErrors);
        }
      });
    }

    if (current === 4) {
      if (!required(values.militaryService)) nextErrors.militaryService = 'Обязательно';
      if (!required(values.hasDriverLicense)) nextErrors.hasDriverLicense = 'Обязательно';
      if (values.hasDriverLicense === 'true' && !required(values.driverLicenseCategoryId)) {
        nextErrors.driverLicenseCategoryId = 'Обязательно';
      }
      if (values.additionalInfo.length > ADDITIONAL_INFO_MAX_LENGTH) {
        nextErrors.additionalInfo = `Максимум ${ADDITIONAL_INFO_MAX_LENGTH} символов`;
      }
      values.relatives.forEach((item, index) => {
        if (!item.view) {
          addRelativeFieldErrors(item, index, nextErrors);
        }
      });
      addRelativeDuplicateErrors(values.relatives, nextErrors);
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
      countryId: Number(values.countryId),
      cityId: Number(values.cityId),
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
        countryId: Number(item.countryId),
        cityId: Number(item.cityId),
        graduationYear: Number(item.graduationYear),
      })),
      workExperiences: values.workExperiences.map((item) => ({
        companyName: item.companyName,
        positionId: Number(item.positionId),
        countryId: Number(item.countryId),
        cityId: Number(item.cityId),
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

    let nextValues = values;

    if (step === 2) {
      const workExperiences = await persistPendingExperiences();
      if (!workExperiences) {
        return false;
      }
      nextValues = { ...values, workExperiences };
    }

    if (step === 3) {
      const educations = await persistPendingEducations();
      if (!educations) {
        return false;
      }
      nextValues = { ...values, educations };
    }

    if (step === 4) {
      const relatives = await persistPendingRelatives();
      if (!relatives) {
        return false;
      }
      nextValues = { ...values, relatives };
    }

    if (isStepDirty(step, nextValues, savedValues) || step === 2 || step === 3) {
      if (step === 2 || step === 3) {
        if (savedFormStep <= step) {
          const shouldAdvance = await onSaveStep(step, buildPayload());
          if (shouldAdvance === false) {
            return false;
          }
          setSavedFormStep(step + 1);
        }
        setSavedValues(cloneFormValues(nextValues));
      } else {
        const shouldAdvance = await onSaveStep(step, buildPayload());
        if (shouldAdvance === false) {
          return false;
        }
        setSavedValues(cloneFormValues(nextValues));
      }
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
            min={values.birthDate || undefined}
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
            maxLength={ADDRESS_MAX_LENGTH}
            showCount
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
            min={values.birthDate || undefined}
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
          {fieldErrors.educations ? (
            <p className="text-sm text-rose-600">{fieldErrors.educations}</p>
          ) : null}
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
              onChange={(next) => patchEducation(index, next)}
              onSave={() => void saveEducation(index)}
              onEdit={() => patchEducation(index, { ...item, view: false })}
              onDelete={() => void deleteEducation(index)}
              onToggleExpand={() =>
                patchEducation(index, { ...item, expanded: !item.expanded })
              }
            />
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
          {fieldErrors.experiences ? (
            <p className="text-sm text-rose-600">{fieldErrors.experiences}</p>
          ) : null}
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
              onChange={(next) => patchExperience(index, next)}
              onSave={() => void saveExperience(index)}
              onEdit={() => patchExperience(index, { ...item, view: false })}
              onDelete={() => void deleteExperience(index)}
              onToggleExpand={() =>
                patchExperience(index, { ...item, expanded: !item.expanded })
              }
            />
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
        <div className="space-y-6">
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
                maxLength={ADDITIONAL_INFO_MAX_LENGTH}
                showCount
                value={values.additionalInfo}
                error={fieldErrors.additionalInfo}
                onChange={(event) => setField('additionalInfo', event.target.value)}
              />
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-line bg-white p-4 md:p-6">
            <h2 className="text-lg font-semibold">Родственники</h2>
            {values.relatives.map((item, index) => (
              <RelativeCard
                key={item.key}
                item={item}
                index={index}
                errors={fieldErrors}
                saving={savingKey === item.key}
                onChange={(next) => patchRelative(index, next)}
                onSave={() => void saveRelative(index)}
                onEdit={() => patchRelative(index, { ...item, view: false })}
                onDelete={() => void deleteRelative(index)}
                onToggleExpand={() =>
                  patchRelative(index, { ...item, expanded: !item.expanded })
                }
              />
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setField('relatives', [...values.relatives, emptyRelative()])}
            >
              Добавить родственника
            </Button>
          </section>
        </div>
      ) : null}

      {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}
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
            disabled={submitting || Boolean(savingKey)}
            onClick={() => void handleNext()}
          >
            {submitting || savingKey ? 'Сохраняем...' : 'Далее'}
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1 sm:flex-none"
            disabled={submitting || Boolean(savingKey)}
            onClick={() => void handleSubmit()}
          >
            {submitting || savingKey ? 'Сохраняем...' : 'Сохранить анкету'}
          </Button>
        )}
      </div>
    </div>
  );
}
