import { yearFromIsoDate } from '../../../utils/date.ts';
import {
  ADDITIONAL_INFO_MAX_LENGTH,
  ADDRESS_MAX_LENGTH,
  BIRTH_DATE_MAX,
  isBirthDateAllowed,
  isPassportNumber,
  isPassportSeries,
  isPinfl,
  isValidPhone,
  required,
  RESPONSIBILITIES_MAX_LENGTH,
  todayIsoDate,
} from '../../../utils/validation.ts';
import type { CreateEmployeePayload, EmployeeDetails } from '../types/employee.ts';
import type { EducationCardItem } from '../components/EducationCard.tsx';
import type { ExperienceCardItem } from '../components/ExperienceCard.tsx';
import type { RelativeCardItem } from '../components/RelativeCard.tsx';

export type AdminFormValues = {
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

function nextItemKey() {
  return `item-${crypto.randomUUID()}`;
}

export function emptyEducation(): EducationCardItem {
  return {
    key: nextItemKey(),
    institutionName: '',
    specialty: '',
    educationLevelId: '',
    countryId: '',
    cityId: '',
    graduationYear: new Date().getFullYear(),
    view: false,
    expanded: true,
  };
}

export function emptyExperience(): ExperienceCardItem {
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
    expanded: true,
  };
}

export function emptyRelative(): RelativeCardItem {
  return {
    key: nextItemKey(),
    fullName: '',
    relationshipType: '',
    occupation: '',
    birthDate: '',
    phone: '',
    view: false,
    expanded: true,
  };
}

export function fromEmployee(employee: EmployeeDetails): AdminFormValues {
  return {
    birthDate: employee.birthDate?.toString().slice(0, 10) ?? '',
    pinfl: employee.pinfl ?? '',
    passportSeries: employee.passport.series ?? '',
    passportNumber: employee.passport.number ?? '',
    passportExpireDate: employee.passport.expireDate?.toString().slice(0, 10) ?? '',
    passportIssuedBy: employee.passport.issuedBy ?? '',
    phone: employee.contact.phone ?? '',
    countryId: employee.contact.country ? String(employee.contact.country.id) : '',
    cityId: employee.contact.city ? String(employee.contact.city.id) : '',
    address: employee.contact.address ?? '',
    employeeNumber: employee.employeeNumber ?? '',
    hireDate: employee.hireDate?.toString().slice(0, 10) ?? '',
    genderId: String(employee.gender.id),
    citizenshipId: String(employee.citizenship.id),
    nationalityId: String(employee.nationality.id),
    departmentId: employee.department ? String(employee.department.id) : '',
    positionId: employee.position ? String(employee.position.id) : '',
    employmentTypeId: employee.employmentType ? String(employee.employmentType.id) : '',
    maritalStatusId: String(employee.maritalStatus.id),
    driverLicenseCategoryId: employee.driverLicense.categoryId
      ? String(employee.driverLicense.categoryId)
      : '',
    militaryService: String(employee.militaryService),
    hasDriverLicense: String(employee.driverLicense.hasLicense),
    additionalInfo: employee.additionalInfo ?? '',
    educations: employee.education.map((item) => ({
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
      expanded: true,
    })),
    workExperiences: employee.workExperience.map((item) => ({
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
      expanded: true,
    })),
    relatives: (employee.relatives ?? []).map((item) => ({
      key: item.id ? `relative-${item.id}` : nextItemKey(),
      id: item.id,
      fullName: item.fullName,
      relationshipType: item.relationshipType,
      occupation: item.occupation ?? '',
      birthDate: item.birthDate?.toString().slice(0, 10) ?? '',
      phone: item.phone ?? '',
      view: Boolean(item.id),
      expanded: true,
    })),
  };
}

export function collectPersonalErrors(values: AdminFormValues) {
  const nextErrors: Record<string, string> = {};
  if (!required(values.birthDate)) {
    nextErrors.birthDate = 'Укажите дату рождения';
  } else if (!isBirthDateAllowed(values.birthDate)) {
    nextErrors.birthDate = `Сотрудник должен быть не моложе 16 лет (год рождения не позже ${BIRTH_DATE_MAX.slice(0, 4)})`;
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
  } else if (values.birthDate && values.passportExpireDate < values.birthDate) {
    nextErrors.passportExpireDate =
      'Срок действия паспорта не может быть раньше даты рождения';
  }
  if (!required(values.passportIssuedBy)) nextErrors.passportIssuedBy = 'Обязательно';
  if (!required(values.phone)) {
    nextErrors.phone = 'Обязательно';
  } else if (!isValidPhone(values.phone)) {
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
  return nextErrors;
}

export function collectJobErrors(values: AdminFormValues) {
  const nextErrors: Record<string, string> = {};
  if (!required(values.employeeNumber)) nextErrors.employeeNumber = 'Обязательно';
  if (!required(values.hireDate)) {
    nextErrors.hireDate = 'Обязательно';
  } else if (values.birthDate && values.hireDate < values.birthDate) {
    nextErrors.hireDate = 'Дата приёма не может быть раньше даты рождения';
  }
  if (!required(values.departmentId)) nextErrors.departmentId = 'Обязательно';
  if (!required(values.positionId)) nextErrors.positionId = 'Обязательно';
  if (!required(values.employmentTypeId)) nextErrors.employmentTypeId = 'Обязательно';
  if (!required(values.militaryService)) nextErrors.militaryService = 'Обязательно';
  if (!required(values.hasDriverLicense)) nextErrors.hasDriverLicense = 'Обязательно';
  if (values.hasDriverLicense === 'true' && !required(values.driverLicenseCategoryId)) {
    nextErrors.driverLicenseCategoryId = 'Обязательно';
  }
  if (values.additionalInfo.length > ADDITIONAL_INFO_MAX_LENGTH) {
    nextErrors.additionalInfo = `Максимум ${ADDITIONAL_INFO_MAX_LENGTH} символов`;
  }
  return nextErrors;
}

export function personalPayload(values: AdminFormValues): Partial<CreateEmployeePayload> {
  return {
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
    genderId: Number(values.genderId),
    citizenshipId: Number(values.citizenshipId),
    nationalityId: Number(values.nationalityId),
    maritalStatusId: Number(values.maritalStatusId),
  };
}

export function jobPayload(values: AdminFormValues): Partial<CreateEmployeePayload> {
  return {
    employeeNumber: values.employeeNumber,
    hireDate: values.hireDate || undefined,
    departmentId: values.departmentId ? Number(values.departmentId) : undefined,
    positionId: values.positionId ? Number(values.positionId) : undefined,
    employmentTypeId: values.employmentTypeId
      ? Number(values.employmentTypeId)
      : undefined,
    militaryService: values.militaryService === 'true',
    hasDriverLicense: values.hasDriverLicense === 'true',
    driverLicenseCategoryId:
      values.hasDriverLicense === 'true'
        ? Number(values.driverLicenseCategoryId) || undefined
        : undefined,
    additionalInfo: values.additionalInfo || undefined,
  };
}

export function experiencePayload(item: ExperienceCardItem) {
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

export function educationPayload(item: EducationCardItem) {
  return {
    institutionName: item.institutionName,
    specialty: item.specialty,
    educationLevelId: Number(item.educationLevelId),
    countryId: Number(item.countryId),
    cityId: Number(item.cityId),
    graduationYear: Number(item.graduationYear),
  };
}

export function relativePayload(item: RelativeCardItem) {
  return {
    fullName: item.fullName.trim(),
    relationshipType: item.relationshipType,
    occupation: item.occupation.trim(),
    birthDate: item.birthDate,
    phone: item.phone,
  };
}

export function addExperienceFieldErrors(
  item: ExperienceCardItem,
  index: number,
  nextErrors: Record<string, string>,
  birthDate?: string,
) {
  if (!item.companyName.trim()) nextErrors[`experience-${index}-company`] = 'Обязательно';
  if (!item.positionId) nextErrors[`experience-${index}-position`] = 'Обязательно';
  if (!item.countryId) nextErrors[`experience-${index}-country`] = 'Обязательно';
  if (!item.cityId) nextErrors[`experience-${index}-city`] = 'Обязательно';
  if (!item.startDate) {
    nextErrors[`experience-${index}-start`] = 'Обязательно';
  } else if (item.startDate > todayIsoDate()) {
    nextErrors[`experience-${index}-start`] = 'Дата начала не может быть в будущем';
  } else if (birthDate && item.startDate < birthDate) {
    nextErrors[`experience-${index}-start`] =
      'Дата начала не может быть раньше даты рождения';
  }
  if (!item.isCurrent && !item.endDate) {
    nextErrors[`experience-${index}-end`] = 'Обязательно';
  } else if (birthDate && !item.isCurrent && item.endDate && item.endDate < birthDate) {
    nextErrors[`experience-${index}-end`] =
      'Дата окончания не может быть раньше даты рождения';
  } else if (item.startDate && !item.isCurrent && item.endDate && item.startDate > item.endDate) {
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

export function addEducationFieldErrors(
  item: EducationCardItem,
  index: number,
  nextErrors: Record<string, string>,
  birthDate?: string,
) {
  if (!item.institutionName.trim()) nextErrors[`education-${index}-institution`] = 'Обязательно';
  if (!item.specialty.trim()) nextErrors[`education-${index}-specialty`] = 'Обязательно';
  if (!item.educationLevelId) nextErrors[`education-${index}-level`] = 'Обязательно';
  if (!item.countryId) nextErrors[`education-${index}-country`] = 'Обязательно';
  if (!item.cityId) nextErrors[`education-${index}-city`] = 'Обязательно';
  if (!item.graduationYear) {
    nextErrors[`education-${index}-year`] = 'Обязательно';
  } else {
    const birthYear = yearFromIsoDate(birthDate);
    if (birthYear && item.graduationYear < birthYear) {
      nextErrors[`education-${index}-year`] =
        'Год окончания не может быть раньше года рождения';
    }
  }
}

export function addRelativeFieldErrors(
  item: RelativeCardItem,
  index: number,
  nextErrors: Record<string, string>,
) {
  if (!item.fullName.trim()) nextErrors[`relative-${index}-name`] = 'Обязательно';
  if (!item.relationshipType) nextErrors[`relative-${index}-relationship`] = 'Обязательно';
  if (!item.occupation.trim()) nextErrors[`relative-${index}-occupation`] = 'Обязательно';
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
