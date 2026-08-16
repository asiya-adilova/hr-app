import type { ReferenceMap } from './references.ts';

export type ReferenceCatalogItem = {
  key: keyof ReferenceMap;
  title: string;
  description: string;
  path: string;
};

export const referenceCatalog: ReferenceCatalogItem[] = [
  {
    key: 'genders',
    title: 'Пол',
    description: 'Справочник полов',
    path: '/genders',
  },
  {
    key: 'citizenships',
    title: 'Гражданство',
    description: 'Страны гражданства',
    path: '/citizenships',
  },
  {
    key: 'nationalities',
    title: 'Национальность',
    description: 'Национальности',
    path: '/nationalities',
  },
  {
    key: 'departments',
    title: 'Подразделения',
    description: 'Структура организации',
    path: '/departments',
  },
  {
    key: 'positions',
    title: 'Должности',
    description: 'Штатные должности',
    path: '/positions',
  },
  {
    key: 'employmentTypes',
    title: 'Тип занятости',
    description: 'Виды трудовых договоров',
    path: '/employment-types',
  },
  {
    key: 'educationLevels',
    title: 'Уровень образования',
    description: 'Уровни образования',
    path: '/education-levels',
  },
  {
    key: 'maritalStatuses',
    title: 'Семейное положение',
    description: 'Семейные статусы',
    path: '/marital-statuses',
  },
  {
    key: 'driverLicenseCategories',
    title: 'Категории прав',
    description: 'Категории водительских удостоверений',
    path: '/driver-license-categories',
  },
];
