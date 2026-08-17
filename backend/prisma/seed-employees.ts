import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client';

function monthsBetween(start: Date, end: Date): number {
  const years = end.getUTCFullYear() - start.getUTCFullYear();
  const months = end.getUTCMonth() - start.getUTCMonth();
  let total = years * 12 + months;
  if (end.getUTCDate() < start.getUTCDate()) {
    total -= 1;
  }
  return Math.max(0, total);
}

function sumExperienceMonths(
  items: Array<{
    startDate: Date;
    endDate: Date | null;
    position?: { name: string } | null;
  }>,
  specialtyNames: Array<string | null | undefined>,
) {
  const specialties = new Set(
    specialtyNames
      .filter((name): name is string => Boolean(name?.trim()))
      .map((name) => name.trim().toLowerCase()),
  );
  const now = new Date();
  let totalExperienceMonths = 0;
  let specialtyExperienceMonths = 0;

  for (const item of items) {
    const months = monthsBetween(item.startDate, item.endDate ?? now);
    totalExperienceMonths += months;
    if (
      item.position &&
      specialties.has(item.position.name.trim().toLowerCase())
    ) {
      specialtyExperienceMonths += months;
    }
  }

  return { totalExperienceMonths, specialtyExperienceMonths };
}

const EMPLOYEE_PASSWORD = process.env.EMPLOYEE_SEED_PASSWORD ?? 'Employee123!';

const D = {
  it: 'Департамент информационных технологий',
  hr: 'Департамент кадров',
  fin: 'Финансовый департамент',
  law: 'Юридический департамент',
  audit: 'Департамент внутреннего аудита',
  superv: 'Департамент банковского надзора',
  money: 'Департамент денежно-кредитной политики',
  pay: 'Департамент платежных систем',
  cyber: 'Департамент кибербезопасности',
  admin: 'Административный департамент',
} as const;

const P = {
  programmer: 'Программист',
  swe: 'Software Engineer',
  lead: 'Ведущий специалист',
  chief: 'Главный специалист',
  head: 'Начальник отдела',
  deputy: 'Заместитель начальника отдела',
  director: 'Директор департамента',
  hr: 'HR-специалист',
  ba: 'Бизнес-аналитик',
  sa: 'Системный аналитик',
  sysadmin: 'Системный администратор',
  infosec: 'Специалист по информационной безопасности',
  lawyer: 'Юрисконсульт',
  economist: 'Экономист',
  accountant: 'Бухгалтер',
} as const;

type PersonSeed = {
  lastName: string;
  firstName: string;
  middleName: string;
  gender: 'Мужской' | 'Женский';
  department: string;
  position: string;
  hireDate: string;
  city?: string;
  citizenship?: string;
  nationality?: string;
  employmentType?: string;
  maritalStatus?: string;
  militaryService?: boolean;
  driverLicense?: string;
};

const PEOPLE: PersonSeed[] = [
  {
    lastName: 'Каримов',
    firstName: 'Алишер',
    middleName: 'Рустамович',
    gender: 'Мужской',
    department: D.it,
    position: P.programmer,
    hireDate: '2021-03-15',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Рахимова',
    firstName: 'Нилуфар',
    middleName: 'Бахтиёровна',
    gender: 'Женский',
    department: D.hr,
    position: P.hr,
    hireDate: '2019-08-01',
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Исмаилов',
    firstName: 'Жахонгир',
    middleName: 'Одилович',
    gender: 'Мужской',
    department: D.fin,
    position: P.economist,
    hireDate: '2018-02-12',
    city: 'Самарканд',
    militaryService: true,
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Юсупова',
    firstName: 'Дилноза',
    middleName: 'Алишеровна',
    gender: 'Женский',
    department: D.law,
    position: P.lawyer,
    hireDate: '2022-06-20',
    maritalStatus: 'Холост / Не замужем',
  },
  {
    lastName: 'Ахмедов',
    firstName: 'Бехзод',
    middleName: 'Улугбекович',
    gender: 'Мужской',
    department: D.audit,
    position: P.chief,
    hireDate: '2017-11-03',
    militaryService: true,
    driverLicense: 'C',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Турсунов',
    firstName: 'Шохрух',
    middleName: 'Маратович',
    gender: 'Мужской',
    department: D.superv,
    position: P.lead,
    hireDate: '2020-01-14',
    driverLicense: 'B',
  },
  {
    lastName: 'Назарова',
    firstName: 'Мадина',
    middleName: 'Искандаровна',
    gender: 'Женский',
    department: D.money,
    position: P.economist,
    hireDate: '2023-04-05',
    maritalStatus: 'Холост / Не замужем',
  },
  {
    lastName: 'Усманов',
    firstName: 'Сардор',
    middleName: 'Камилжонович',
    gender: 'Мужской',
    department: D.pay,
    position: P.ba,
    hireDate: '2016-09-22',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Садыков',
    firstName: 'Дилшод',
    middleName: 'Равшанович',
    gender: 'Мужской',
    department: D.cyber,
    position: P.infosec,
    hireDate: '2021-07-19',
    militaryService: true,
    driverLicense: 'BE',
  },
  {
    lastName: 'Ходжаева',
    firstName: 'Севара',
    middleName: 'Шухратовна',
    gender: 'Женский',
    department: D.admin,
    position: P.lead,
    hireDate: '2015-05-11',
    city: 'Бухара',
    maritalStatus: 'Женат / Замужем',
  },

  {
    lastName: 'Мирзаев',
    firstName: 'Акмал',
    middleName: 'Баходирович',
    gender: 'Мужской',
    department: D.it,
    position: P.swe,
    hireDate: '2018-09-01',
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Турсунова',
    firstName: 'Гульноза',
    middleName: 'Равшановна',
    gender: 'Женский',
    department: D.hr,
    position: P.lead,
    hireDate: '2015-04-14',
    maritalStatus: 'Разведен / Разведена',
  },
  {
    lastName: 'Алимов',
    firstName: 'Ойбек',
    middleName: 'Шухратович',
    gender: 'Мужской',
    department: D.fin,
    position: P.accountant,
    hireDate: '2014-06-18',
    militaryService: true,
    driverLicense: 'B',
  },
  {
    lastName: 'Ахмедова',
    firstName: 'Шахноза',
    middleName: 'Улугбековна',
    gender: 'Женский',
    department: D.law,
    position: P.chief,
    hireDate: '2016-03-07',
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Ганиев',
    firstName: 'Рустам',
    middleName: 'Исмаилович',
    gender: 'Мужской',
    department: D.audit,
    position: P.lead,
    hireDate: '2020-04-21',
    citizenship: 'Казахстан',
    nationality: 'Казах',
    maritalStatus: 'Холост / Не замужем',
  },
  {
    lastName: 'Эргашев',
    firstName: 'Тимур',
    middleName: 'Азаматович',
    gender: 'Мужской',
    department: D.superv,
    position: P.chief,
    hireDate: '2018-07-25',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Каримова',
    firstName: 'Феруза',
    middleName: 'Одиловна',
    gender: 'Женский',
    department: D.money,
    position: P.chief,
    hireDate: '2017-02-27',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Абдуллаев',
    firstName: 'Фарход',
    middleName: 'Нодирович',
    gender: 'Мужской',
    department: D.pay,
    position: P.programmer,
    hireDate: '2022-11-11',
    driverLicense: 'B',
  },
  {
    lastName: 'Исмаилова',
    firstName: 'Зухра',
    middleName: 'Камилжоновна',
    gender: 'Женский',
    department: D.cyber,
    position: P.sysadmin,
    hireDate: '2019-03-04',
    city: 'Наманган',
  },
  {
    lastName: 'Хасанов',
    firstName: 'Жасур',
    middleName: 'Икромжонович',
    gender: 'Мужской',
    department: D.admin,
    position: P.chief,
    hireDate: '2021-01-18',
    militaryService: true,
    maritalStatus: 'Женат / Замужем',
  },

  {
    lastName: 'Нурматов',
    firstName: 'Ислом',
    middleName: 'Бахтиёрович',
    gender: 'Мужской',
    department: D.it,
    position: P.sysadmin,
    hireDate: '2024-02-12',
    employmentType: 'Срочный трудовой договор',
  },
  {
    lastName: 'Мирзаева',
    firstName: 'Лола',
    middleName: 'Баходировна',
    gender: 'Женский',
    department: D.hr,
    position: P.chief,
    hireDate: '2023-01-23',
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Саидов',
    firstName: 'Нодир',
    middleName: 'Музаффарович',
    gender: 'Мужской',
    department: D.fin,
    position: P.chief,
    hireDate: '2021-12-01',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Садыкова',
    firstName: 'Камола',
    middleName: 'Тимуровна',
    gender: 'Женский',
    department: D.law,
    position: P.head,
    hireDate: '2019-11-15',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Махмудов',
    firstName: 'Баходир',
    middleName: 'Элёрович',
    gender: 'Мужской',
    department: D.audit,
    position: P.head,
    hireDate: '2023-08-16',
    driverLicense: 'B',
  },
  {
    lastName: 'Усманова',
    firstName: 'Мухлиса',
    middleName: 'Сардоровна',
    gender: 'Женский',
    department: D.superv,
    position: P.deputy,
    hireDate: '2024-05-06',
    maritalStatus: 'Холост / Не замужем',
  },
  {
    lastName: 'Ибрагимов',
    firstName: 'Азиз',
    middleName: 'Комилжонович',
    gender: 'Мужской',
    department: D.money,
    position: P.lead,
    hireDate: '2019-06-03',
    citizenship: 'Кыргызстан',
    nationality: 'Киргиз',
    militaryService: true,
  },
  {
    lastName: 'Ганиева',
    firstName: 'Азиза',
    middleName: 'Жахонгировна',
    gender: 'Женский',
    department: D.pay,
    position: P.sa,
    hireDate: '2018-12-17',
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Валиев',
    firstName: 'Элёр',
    middleName: 'Давронович',
    gender: 'Мужской',
    department: D.cyber,
    position: P.chief,
    hireDate: '2023-10-31',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Эргашева',
    firstName: 'Дилфуза',
    middleName: 'Нодировна',
    gender: 'Женский',
    department: D.admin,
    position: P.hr,
    hireDate: '2018-04-09',
    city: 'Фергана',
  },

  {
    lastName: 'Шукуров',
    firstName: 'Музаффар',
    middleName: 'Санжарович',
    gender: 'Мужской',
    department: D.it,
    position: P.sa,
    hireDate: '2016-11-20',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Абдуллаева',
    firstName: 'Нодира',
    middleName: 'Икромжоновна',
    gender: 'Женский',
    department: D.hr,
    position: P.head,
    hireDate: '2020-10-05',
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Рахматов',
    firstName: 'Камрон',
    middleName: 'Отабекович',
    gender: 'Мужской',
    department: D.fin,
    position: P.director,
    hireDate: '2017-05-29',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Хасанова',
    firstName: 'Малика',
    middleName: 'Элёровна',
    gender: 'Женский',
    department: D.law,
    position: P.lawyer,
    hireDate: '2024-09-30',
    employmentType: 'Срочный трудовой договор',
  },
  {
    lastName: 'Азизов',
    firstName: 'Даврон',
    middleName: 'Рустамович',
    gender: 'Мужской',
    department: D.audit,
    position: P.lead,
    hireDate: '2015-12-28',
    city: 'Нукус',
    nationality: 'Каракалпак',
    militaryService: true,
    driverLicense: 'C',
  },
  {
    lastName: 'Нурматова',
    firstName: 'Саодат',
    middleName: 'Рустамовна',
    gender: 'Женский',
    department: D.superv,
    position: P.lead,
    hireDate: '2016-08-19',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Файзиев',
    firstName: 'Шухрат',
    middleName: 'Алишерович',
    gender: 'Мужской',
    department: D.money,
    position: P.economist,
    hireDate: '2025-01-20',
    employmentType: 'Полная занятость',
  },
  {
    lastName: 'Холматов',
    firstName: 'Икром',
    middleName: 'Жахонгирович',
    gender: 'Мужской',
    department: D.pay,
    position: P.ba,
    hireDate: '2020-06-08',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Саидова',
    firstName: 'Юлдуз',
    middleName: 'Бахтиёровна',
    gender: 'Женский',
    department: D.cyber,
    position: P.infosec,
    hireDate: '2017-09-12',
    driverLicense: 'B',
    maritalStatus: 'Разведен / Разведена',
  },
  {
    lastName: 'Юлдашев',
    firstName: 'Санжар',
    middleName: 'Бекзодович',
    gender: 'Мужской',
    department: D.admin,
    position: P.lead,
    hireDate: '2024-12-02',
    employmentType: 'Стажировка',
  },

  {
    lastName: 'Расулов',
    firstName: 'Аброр',
    middleName: 'Тимурович',
    gender: 'Мужской',
    department: D.it,
    position: P.head,
    hireDate: '2022-07-08',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Махмудова',
    firstName: 'Барно',
    middleName: 'Азизовна',
    gender: 'Женский',
    department: D.hr,
    position: P.hr,
    hireDate: '2026-03-02',
    employmentType: 'Стажировка',
    maritalStatus: 'Холост / Не замужем',
  },
  {
    lastName: 'Курбонов',
    firstName: 'Улугбек',
    middleName: 'Саидович',
    gender: 'Мужской',
    department: D.fin,
    position: P.accountant,
    hireDate: '2025-08-11',
    driverLicense: 'B',
  },
  {
    lastName: 'Ибрагимова',
    firstName: 'Нигора',
    middleName: 'Давроновна',
    gender: 'Женский',
    department: D.law,
    position: P.lead,
    hireDate: '2014-01-10',
    maritalStatus: 'Вдовец / Вдова',
  },
  {
    lastName: 'Набиев',
    firstName: 'Отабек',
    middleName: 'Рахимович',
    gender: 'Мужской',
    department: D.audit,
    position: P.chief,
    hireDate: '2022-02-14',
    citizenship: 'Россия',
    nationality: 'Русский',
    driverLicense: 'B',
  },
  {
    lastName: 'Валиева',
    firstName: 'Зарина',
    middleName: 'Шухратовна',
    gender: 'Женский',
    department: D.superv,
    position: P.chief,
    hireDate: '2021-09-09',
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Солиев',
    firstName: 'Жавлон',
    middleName: 'Мухтарович',
    gender: 'Мужской',
    department: D.money,
    position: P.director,
    hireDate: '2014-10-13',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
  {
    lastName: 'Бозоров',
    firstName: 'Анвар',
    middleName: 'Шукурович',
    gender: 'Мужской',
    department: D.pay,
    position: P.chief,
    hireDate: '2024-03-25',
    employmentType: 'Неполная занятость',
  },
  {
    lastName: 'Тошматов',
    firstName: 'Шерзод',
    middleName: 'Хасанович',
    gender: 'Мужской',
    department: D.cyber,
    position: P.sysadmin,
    hireDate: '2025-11-07',
    militaryService: true,
    driverLicense: 'B',
  },
  {
    lastName: 'Исматов',
    firstName: 'Лазиз',
    middleName: 'Бахромжонович',
    gender: 'Мужской',
    department: D.admin,
    position: P.director,
    hireDate: '2026-06-16',
    militaryService: true,
    driverLicense: 'B',
    maritalStatus: 'Женат / Замужем',
  },
];

type EducationSeed = {
  institution: string;
  specialty: string;
  educationLevel: string;
  country: string;
  city: string;
  graduationYear: number;
};

type ExperienceSeed = {
  companyName: string;
  position: string;
  country: string;
  city: string;
  startDate: string;
  endDate?: string;
  responsibilities: string;
};

const EDUCATION_BY_DEPT: Record<
  string,
  { institution: string; specialty: string; city: string; master?: string }
> = {
  [D.it]: {
    institution:
      'Ташкентский университет информационных технологий имени Мухаммада ал-Хоразмий',
    specialty: 'Программная инженерия',
    city: 'Ташкент',
    master: 'Информационные системы и технологии',
  },
  [D.hr]: {
    institution: 'Национальный университет Узбекистана имени Мирзо Улугбека',
    specialty: 'Управление персоналом',
    city: 'Ташкент',
    master: 'Психология управления',
  },
  [D.fin]: {
    institution: 'Ташкентский государственный экономический университет',
    specialty: 'Финансы и кредит',
    city: 'Ташкент',
    master: 'Бухгалтерский учёт и аудит',
  },
  [D.law]: {
    institution: 'Ташкентский государственный юридический университет',
    specialty: 'Юриспруденция',
    city: 'Ташкент',
    master: 'Банковское право',
  },
  [D.audit]: {
    institution: 'Ташкентский финансовый институт',
    specialty: 'Аудит и ревизия',
    city: 'Ташкент',
    master: 'Внутренний контроль',
  },
  [D.superv]: {
    institution: 'Ташкентский государственный экономический университет',
    specialty: 'Банковское дело',
    city: 'Ташкент',
    master: 'Финансовый надзор',
  },
  [D.money]: {
    institution: 'Университет мировой экономики и дипломатии',
    specialty: 'Экономика',
    city: 'Ташкент',
    master: 'Макроэкономика',
  },
  [D.pay]: {
    institution: 'ИНХА университет в Ташкенте',
    specialty: 'Информационные технологии',
    city: 'Ташкент',
    master: 'Платёжные системы',
  },
  [D.cyber]: {
    institution: 'Ташкентский государственный технический университет',
    specialty: 'Информационная безопасность',
    city: 'Ташкент',
    master: 'Кибербезопасность',
  },
  [D.admin]: {
    institution: 'Самаркандский государственный университет',
    specialty: 'Государственное управление',
    city: 'Самарканд',
    master: 'Административный менеджмент',
  },
};

const PREVIOUS_JOBS: Record<
  string,
  Array<{
    companyName: string;
    position: string;
    responsibilities: string;
    city?: string;
  }>
> = {
  [D.it]: [
    {
      companyName: 'ООО «EPAM Uzbekistan»',
      position: P.programmer,
      responsibilities:
        'Разработка корпоративных информационных систем и сопровождение внутренних сервисов.',
    },
    {
      companyName: 'АО «Узбектелеком»',
      position: P.swe,
      responsibilities:
        'Проектирование и развитие биллинговых и абонентских сервисов.',
    },
    {
      companyName: 'ГУП «UNICON.UZ»',
      position: P.sa,
      responsibilities:
        'Анализ требований и постановка задач для цифровых продуктов.',
    },
  ],
  [D.hr]: [
    {
      companyName: 'АО «Узпромстройбанк»',
      position: P.hr,
      responsibilities:
        'Подбор персонала, кадровый учёт и сопровождение трудовых договоров.',
    },
    {
      companyName: 'Министерство занятости и сокращения бедности',
      position: P.lead,
      responsibilities: 'Организация кадровых процедур и обучение сотрудников.',
    },
  ],
  [D.fin]: [
    {
      companyName: 'Национальный банк внешнеэкономической деятельности',
      position: P.economist,
      responsibilities:
        'Финансовый анализ, бюджетирование и подготовка отчётности.',
    },
    {
      companyName: 'АО «Узагроэкспортбанк»',
      position: P.accountant,
      responsibilities:
        'Ведение бухгалтерского учёта и расчёты с контрагентами.',
    },
  ],
  [D.law]: [
    {
      companyName: 'Министерство юстиции Республики Узбекистан',
      position: P.lawyer,
      responsibilities:
        'Правовая экспертиза документов и сопровождение договорной работы.',
    },
    {
      companyName: 'АО «Узбекнефтегаз»',
      position: P.chief,
      responsibilities: 'Претензионно-исковая работа и корпоративное право.',
    },
  ],
  [D.audit]: [
    {
      companyName: 'Счётная палата Республики Узбекистан',
      position: P.lead,
      responsibilities:
        'Проведение внутренних проверок и оценка контрольной среды.',
    },
    {
      companyName: 'АО «Асакабанк»',
      position: P.chief,
      responsibilities: 'Аудит финансовых операций и подготовка заключений.',
    },
  ],
  [D.superv]: [
    {
      companyName: 'АО «Народный банк»',
      position: P.lead,
      responsibilities:
        'Анализ соблюдения пруденциальных нормативов и подготовка надзорных материалов.',
    },
    {
      companyName: 'АО «Ипотека-банк»',
      position: P.chief,
      responsibilities: 'Мониторинг рисков кредитных организаций.',
    },
  ],
  [D.money]: [
    {
      companyName: 'Министерство экономики и финансов',
      position: P.economist,
      responsibilities:
        'Макроэкономический анализ и подготовка аналитических записок.',
    },
    {
      companyName: 'Институт прогнозирования и макроэкономических исследований',
      position: P.lead,
      responsibilities:
        'Моделирование денежно-кредитной политики и инфляционных процессов.',
    },
  ],
  [D.pay]: [
    {
      companyName: 'ООО «Payme»',
      position: P.ba,
      responsibilities:
        'Анализ платёжных сценариев и развитие цифровых сервисов.',
    },
    {
      companyName: 'ООО «Click»',
      position: P.programmer,
      responsibilities: 'Разработка интеграций с банками и платёжными шлюзами.',
    },
  ],
  [D.cyber]: [
    {
      companyName: 'Центр кибербезопасности',
      position: P.infosec,
      responsibilities:
        'Мониторинг инцидентов информационной безопасности и реагирование.',
    },
    {
      companyName: 'АО «Узбектелеком»',
      position: P.sysadmin,
      responsibilities:
        'Администрирование защищённой инфраструктуры и сетевых сервисов.',
    },
  ],
  [D.admin]: [
    {
      companyName: 'Хокимият города Ташкента',
      position: P.lead,
      responsibilities:
        'Организационно-административное сопровождение деятельности аппарата.',
    },
    {
      companyName: 'АО «Узбекистон темир йуллари»',
      position: P.chief,
      responsibilities:
        'Координация административных процессов и документооборота.',
    },
  ],
};

const CURRENT_RESPONSIBILITIES: Record<string, string> = {
  [D.it]:
    'Разработка и сопровождение внутренних информационных систем Центрального банка.',
  [D.hr]:
    'Кадровое администрирование, подбор и сопровождение сотрудников банка.',
  [D.fin]: 'Финансовое планирование, учёт и контроль исполнения бюджета.',
  [D.law]: 'Правовая экспертиза документов и сопровождение нормативных актов.',
  [D.audit]:
    'Внутренний аудит процессов и оценка системы внутреннего контроля.',
  [D.superv]: 'Надзор за деятельностью кредитных организаций и анализ рисков.',
  [D.money]:
    'Подготовка материалов по денежно-кредитной политике и макроанализу.',
  [D.pay]:
    'Развитие платёжной инфраструктуры и сопровождение платёжных сервисов.',
  [D.cyber]:
    'Обеспечение информационной безопасности и защита банковской инфраструктуры.',
  [D.admin]:
    'Административное обеспечение деятельности департамента и документооборот.',
};

const STREETS = [
  'ул. Навои',
  'ул. Амира Темура',
  'ул. Бабура',
  'проспект Мустакиллик',
  'ул. Шахрисабзская',
  'ул. Тараса Шевченко',
  'ул. Афросиаб',
  'ул. Нукусская',
  'ул. Янги сергели',
  'ул. Мирабадская',
];

function requireId(
  map: Map<string, number>,
  name: string,
  label: string,
): number {
  const id = map.get(name);
  if (!id) {
    throw new Error(`${label} не найден(а) в справочнике: ${name}`);
  }
  return id;
}

function pad(value: number, size: number): string {
  return String(value).padStart(size, '0');
}

function addMonths(isoDate: string, months: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

function laterDate(left: string, right: string): string {
  return left > right ? left : right;
}

function earlierDate(left: string, right: string): string {
  return left < right ? left : right;
}

function birthDateFor(person: PersonSeed, index: number): string {
  const hireYear = Number(person.hireDate.slice(0, 4));
  const ageAtHire = 24 + (index % 16);
  const year = hireYear - ageAtHire;
  const month = pad((index % 12) + 1, 2);
  const day = pad((index % 27) + 1, 2);
  return `${year}-${month}-${day}`;
}

function buildEducations(
  person: PersonSeed,
  index: number,
  birthYear: number,
): EducationSeed[] {
  const profile = EDUCATION_BY_DEPT[person.department];
  const bachelorYear = Math.min(
    birthYear + 22,
    Number(person.hireDate.slice(0, 4)) - 1,
  );
  const city = profile?.city ?? 'Ташкент';
  const educations: EducationSeed[] = [
    {
      institution:
        profile?.institution ??
        'Национальный университет Узбекистана имени Мирзо Улугбека',
      specialty: profile?.specialty ?? person.position,
      educationLevel: index % 11 === 0 ? 'Высшее образование' : 'Бакалавриат',
      country: 'Узбекистан',
      city,
      graduationYear: bachelorYear,
    },
  ];

  if (index % 3 === 0 && profile?.master) {
    educations.push({
      institution: 'Вестминстерский международный университет в Ташкенте',
      specialty: profile.master,
      educationLevel: 'Магистратура',
      country: 'Узбекистан',
      city: 'Ташкент',
      graduationYear: Math.min(
        bachelorYear + 2,
        Number(person.hireDate.slice(0, 4)),
      ),
    });
  }

  if (index % 17 === 0) {
    educations.push({
      institution: 'Академия государственного управления',
      specialty: person.position,
      educationLevel: 'Докторантура',
      country: 'Узбекистан',
      city: 'Ташкент',
      graduationYear: Math.min(
        bachelorYear + 5,
        Number(person.hireDate.slice(0, 4)),
      ),
    });
  }

  return educations;
}

function buildExperiences(
  person: PersonSeed,
  index: number,
  graduationYear: number,
): ExperienceSeed[] {
  const hire = person.hireDate;
  const city = person.city ?? 'Ташкент';
  const previous = PREVIOUS_JOBS[person.department] ?? [];
  const experiences: ExperienceSeed[] = [];
  const earliestStart = laterDate(
    `${graduationYear}-09-01`,
    addMonths(hire, -84),
  );

  if (previous[0] && earliestStart < addMonths(hire, -6)) {
    const firstEnd = earlierDate(
      addMonths(hire, -18 - (index % 8)),
      addMonths(hire, -2),
    );
    if (earliestStart < firstEnd) {
      experiences.push({
        companyName: previous[0].companyName,
        position: previous[0].position,
        country: 'Узбекистан',
        city: previous[0].city ?? 'Ташкент',
        startDate: earliestStart,
        endDate: firstEnd,
        responsibilities: previous[0].responsibilities,
      });

      const second = previous[1] ?? previous[0];
      const secondStart = addMonths(firstEnd, 1);
      const secondEnd = addMonths(hire, -1);
      if (index % 2 === 0 && secondStart < secondEnd) {
        experiences.push({
          companyName: second.companyName,
          position: index % 4 === 0 ? person.position : second.position,
          country: 'Узбекистан',
          city: second.city ?? city,
          startDate: secondStart,
          endDate: secondEnd,
          responsibilities: second.responsibilities,
        });
      }
    }
  }

  experiences.push({
    companyName: 'Центральный банк Республики Узбекистан',
    position: person.position,
    country: 'Узбекистан',
    city,
    startDate: hire,
    responsibilities:
      CURRENT_RESPONSIBILITIES[person.department] ??
      'Выполнение должностных обязанностей в Центральном банке.',
  });

  return experiences;
}

function spouseName(person: PersonSeed): string {
  if (person.gender === 'Мужской') {
    return `${person.lastName.replace(/ов$/, 'ова').replace(/ев$/, 'ева')} Дилбар ${person.middleName.replace('ович', 'овна')}`;
  }
  return `${person.lastName.replace(/ова$/, 'ов').replace(/ева$/, 'ев')} Жахонгир ${person.middleName.replace('овна', 'ович')}`;
}

export async function seedEmployees(prisma: PrismaClient): Promise<void> {
  const [
    genders,
    citizenships,
    nationalities,
    departments,
    positions,
    employmentTypes,
    educationLevels,
    maritalStatuses,
    licenseCategories,
    countries,
    cities,
  ] = await Promise.all([
    prisma.gender.findMany(),
    prisma.citizenship.findMany(),
    prisma.nationality.findMany(),
    prisma.department.findMany(),
    prisma.position.findMany(),
    prisma.employmentType.findMany(),
    prisma.educationLevel.findMany(),
    prisma.maritalStatus.findMany(),
    prisma.driverLicenseCategory.findMany(),
    prisma.country.findMany(),
    prisma.city.findMany({ include: { country: true } }),
  ]);

  const genderIds = new Map(genders.map((item) => [item.name, item.id]));
  const citizenshipIds = new Map(
    citizenships.map((item) => [item.name, item.id]),
  );
  const nationalityIds = new Map(
    nationalities.map((item) => [item.name, item.id]),
  );
  const departmentIds = new Map(
    departments.map((item) => [item.name, item.id]),
  );
  const positionIds = new Map(positions.map((item) => [item.name, item.id]));
  const employmentTypeIds = new Map(
    employmentTypes.map((item) => [item.name, item.id]),
  );
  const educationLevelIds = new Map(
    educationLevels.map((item) => [item.name, item.id]),
  );
  const maritalStatusIds = new Map(
    maritalStatuses.map((item) => [item.name, item.id]),
  );
  const licenseIds = new Map(
    licenseCategories.map((item) => [item.name, item.id]),
  );
  const countryIds = new Map(countries.map((item) => [item.name, item.id]));
  const cityIds = new Map(
    cities.map((item) => [`${item.country.name}::${item.name}`, item.id]),
  );

  const password = await bcrypt.hash(EMPLOYEE_PASSWORD, 10);
  let created = 0;
  let skipped = 0;

  for (const [index, person] of PEOPLE.entries()) {
    const n = index + 1;
    const email = `seed.employee${pad(n, 2)}@hr.local`;
    const employeeNumber = `EMP-${pad(n, 6)}`;
    const birthDate = birthDateFor(person, index);
    const cityName = person.city ?? 'Ташкент';
    const countryName = 'Узбекистан';
    const citizenshipName = person.citizenship ?? 'Узбекистан';
    const nationalityName = person.nationality ?? 'Узбек';
    const maritalStatusName =
      person.maritalStatus ??
      (index % 4 === 0 ? 'Женат / Замужем' : 'Холост / Не замужем');
    const employmentTypeName =
      person.employmentType ?? 'Бессрочный трудовой договор';
    const educations = buildEducations(
      person,
      index,
      Number(birthDate.slice(0, 4)),
    );
    const experiences = buildExperiences(
      person,
      index,
      educations[0]?.graduationYear ?? Number(birthDate.slice(0, 4)) + 22,
    );
    const { totalExperienceMonths, specialtyExperienceMonths } =
      sumExperienceMonths(
        experiences.map((item) => ({
          startDate: new Date(item.startDate),
          endDate: item.endDate ? new Date(item.endDate) : null,
          position: { name: item.position },
        })),
        [person.position, ...educations.map((item) => item.specialty)],
      );

    const account = await prisma.account.upsert({
      where: { email },
      update: {
        password,
        role: 'EMPLOYEE',
        firstName: person.firstName,
        lastName: person.lastName,
        middleName: person.middleName,
      },
      create: {
        email,
        password,
        role: 'EMPLOYEE',
        firstName: person.firstName,
        lastName: person.lastName,
        middleName: person.middleName,
      },
    });

    const existing = await prisma.employee.findUnique({
      where: { accountId: account.id },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    const relatives =
      maritalStatusName === 'Женат / Замужем'
        ? [
            {
              fullName: spouseName(person),
              relationship: person.gender === 'Мужской' ? 'Супруга' : 'Супруг',
              birthDate: new Date(addMonths(birthDate, -18)),
              phone: `+99891${pad(2000000 + n, 7)}`,
              workplace: 'Частный сектор',
            },
          ]
        : [];

    await prisma.employee.create({
      data: {
        accountId: account.id,
        birthDate: new Date(birthDate),
        pinfl: `${person.gender === 'Мужской' ? '3' : '4'}${birthDate.replace(/-/g, '').slice(2)}${pad(1000000 + n, 7)}`,
        passportSeries: ['AA', 'AB', 'AC', 'AD', 'AE'][index % 5],
        passportNumber: pad(1000000 + n, 7),
        passportExpireDate: new Date(`${2030 + (index % 6)}-06-15`),
        passportIssuedBy: `ОВД ${cityName}`,
        phone: `+99890${pad(1000000 + n, 7)}`,
        address: `${cityName}, ${STREETS[index % STREETS.length]}, дом ${n + 3}, кв. ${(index % 40) + 1}`,
        countryId: requireId(countryIds, countryName, 'Страна'),
        cityId: requireId(cityIds, `${countryName}::${cityName}`, 'Город'),
        employeeNumber,
        hireDate: new Date(person.hireDate),
        formStep: 5,
        totalExperienceMonths,
        specialtyExperienceMonths,
        militaryService: person.militaryService ?? false,
        hasDriverLicense: Boolean(person.driverLicense),
        additionalInfo: `Демо-сотрудник ${employeeNumber}`,
        genderId: requireId(genderIds, person.gender, 'Пол'),
        citizenshipId: requireId(
          citizenshipIds,
          citizenshipName,
          'Гражданство',
        ),
        nationalityId: requireId(
          nationalityIds,
          nationalityName,
          'Национальность',
        ),
        departmentId: requireId(
          departmentIds,
          person.department,
          'Подразделение',
        ),
        positionId: requireId(positionIds, person.position, 'Должность'),
        employmentTypeId: requireId(
          employmentTypeIds,
          employmentTypeName,
          'Тип занятости',
        ),
        maritalStatusId: requireId(
          maritalStatusIds,
          maritalStatusName,
          'Семейное положение',
        ),
        driverLicenseCategoryId: person.driverLicense
          ? requireId(
              licenseIds,
              person.driverLicense,
              'Категория водительского удостоверения',
            )
          : null,
        educations: {
          create: educations.map((item) => ({
            institution: item.institution,
            specialty: item.specialty,
            educationLevelId: requireId(
              educationLevelIds,
              item.educationLevel,
              'Уровень образования',
            ),
            countryId: requireId(countryIds, item.country, 'Страна'),
            cityId: requireId(
              cityIds,
              `${item.country}::${item.city}`,
              'Город',
            ),
            graduationYear: item.graduationYear,
          })),
        },
        workExperiences: {
          create: experiences.map((item) => ({
            companyName: item.companyName,
            positionId: requireId(positionIds, item.position, 'Должность'),
            countryId: requireId(countryIds, item.country, 'Страна'),
            cityId: requireId(
              cityIds,
              `${item.country}::${item.city}`,
              'Город',
            ),
            startDate: new Date(item.startDate),
            endDate: item.endDate ? new Date(item.endDate) : null,
            responsibilities: item.responsibilities,
          })),
        },
        relatives: {
          create: relatives,
        },
      },
    });

    created += 1;
  }

  console.log(
    `Employee seed complete: ${created} created, ${skipped} skipped. Login password: ${EMPLOYEE_PASSWORD}`,
  );
}
