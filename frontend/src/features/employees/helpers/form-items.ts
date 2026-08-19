import type { EducationCardItem } from '../components/EducationCard.tsx';
import type { ExperienceCardItem } from '../components/ExperienceCard.tsx';
import type { RelativeCardItem } from '../components/RelativeCard.tsx';

export function nextItemKey() {
  return `item-${crypto.randomUUID()}`;
}

export function emptyEducation(expanded = true): EducationCardItem {
  return {
    key: nextItemKey(),
    institutionName: '',
    specialty: '',
    educationLevelId: '',
    countryId: '',
    cityId: '',
    graduationYear: new Date().getFullYear(),
    view: false,
    expanded,
  };
}

export function emptyExperience(expanded = true): ExperienceCardItem {
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
    expanded,
  };
}

export function emptyRelative(expanded = true): RelativeCardItem {
  return {
    key: nextItemKey(),
    fullName: '',
    relationshipType: '',
    occupation: '',
    birthDate: '',
    phone: '',
    view: false,
    expanded,
  };
}
