import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { seedAdmin } from './seed-admin';
import { seedEmployees } from './seed-employees';

const prisma: PrismaClient = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Gender
  await prisma.gender.createMany({
    data: [{ name: 'Мужской' }, { name: 'Женский' }],
    skipDuplicates: true,
  });

  // Citizenship
  await prisma.citizenship.createMany({
    data: [
      { name: 'Узбекистан' },
      { name: 'Казахстан' },
      { name: 'Кыргызстан' },
      { name: 'Таджикистан' },
      { name: 'Туркменистан' },
      { name: 'Россия' },
      { name: 'Афганистан' },
      { name: 'Азербайджан' },
      { name: 'Армения' },
      { name: 'Грузия' },
      { name: 'Беларусь' },
      { name: 'Украина' },
      { name: 'Другое' },
    ],
    skipDuplicates: true,
  });

  // Nationality
  await prisma.nationality.createMany({
    data: [
      { name: 'Узбек' },
      { name: 'Казах' },
      { name: 'Киргиз' },
      { name: 'Таджик' },
      { name: 'Туркмен' },
      { name: 'Русский' },
      { name: 'Каракалпак' },
      { name: 'Татарин' },
      { name: 'Кореец' },
      { name: 'Украинец' },
      { name: 'Армянин' },
      { name: 'Азербайджанец' },
      { name: 'Грузин' },
      { name: 'Другое' },
    ],
    skipDuplicates: true,
  });

  // Department
  await prisma.department.createMany({
    data: [
      { name: 'Департамент информационных технологий' },
      { name: 'Департамент кадров' },
      { name: 'Финансовый департамент' },
      { name: 'Юридический департамент' },
      { name: 'Департамент внутреннего аудита' },
      { name: 'Департамент банковского надзора' },
      { name: 'Департамент денежно-кредитной политики' },
      { name: 'Департамент платежных систем' },
      { name: 'Департамент кибербезопасности' },
      { name: 'Административный департамент' },
    ],
    skipDuplicates: true,
  });

  // Position
  await prisma.position.createMany({
    data: [
      { name: 'Программист' },
      { name: 'Software Engineer' },
      { name: 'Ведущий специалист' },
      { name: 'Главный специалист' },
      { name: 'Начальник отдела' },
      { name: 'Заместитель начальника отдела' },
      { name: 'Директор департамента' },
      { name: 'HR-специалист' },
      { name: 'Бизнес-аналитик' },
      { name: 'Системный аналитик' },
      { name: 'Системный администратор' },
      { name: 'Специалист по информационной безопасности' },
      { name: 'Юрисконсульт' },
      { name: 'Экономист' },
      { name: 'Бухгалтер' },
    ],
    skipDuplicates: true,
  });

  // Employment type
  await prisma.employmentType.createMany({
    data: [
      { name: 'Полная занятость' },
      { name: 'Неполная занятость' },
      { name: 'Срочный трудовой договор' },
      { name: 'Бессрочный трудовой договор' },
      { name: 'Стажировка' },
    ],
    skipDuplicates: true,
  });

  // Education level
  await prisma.educationLevel.createMany({
    data: [
      { name: 'Среднее образование' },
      { name: 'Среднее специальное образование' },
      { name: 'Высшее образование' },
      { name: 'Бакалавриат' },
      { name: 'Магистратура' },
      { name: 'Докторантура' },
    ],
    skipDuplicates: true,
  });

  // Marital status
  await prisma.maritalStatus.createMany({
    data: [
      { name: 'Холост / Не замужем' },
      { name: 'Женат / Замужем' },
      { name: 'Разведен / Разведена' },
      { name: 'Вдовец / Вдова' },
    ],
    skipDuplicates: true,
  });

  // Driver license category
  await prisma.driverLicenseCategory.createMany({
    data: [
      { name: 'A' },
      { name: 'A1' },
      { name: 'B' },
      { name: 'C' },
      { name: 'D' },
      { name: 'BE' },
      { name: 'CE' },
      { name: 'DE' },
    ],
    skipDuplicates: true,
  });

  const citiesByCountry: Record<string, string[]> = {
    Узбекистан: [
      'Ташкент',
      'Самарканд',
      'Бухара',
      'Наманган',
      'Андижан',
      'Фергана',
      'Нукус',
      'Карши',
      'Термез',
      'Ургенч',
      'Джизак',
      'Гулистан',
      'Навои',
      'Коканд',
      'Маргилан',
    ],
    Казахстан: [
      'Астана',
      'Алматы',
      'Шымкент',
      'Караганда',
      'Актобе',
      'Тараз',
      'Павлодар',
      'Усть-Каменогорск',
      'Семей',
      'Атырау',
    ],
    Кыргызстан: ['Бишкек', 'Ош', 'Джалал-Абад', 'Каракол'],
    Таджикистан: ['Душанбе', 'Худжанд', 'Бохтар', 'Куляб'],
    Туркменистан: ['Ашхабад', 'Туркменабад', 'Дашогуз', 'Мары'],
    Россия: [
      'Москва',
      'Санкт-Петербург',
      'Новосибирск',
      'Екатеринбург',
      'Казань',
      'Нижний Новгород',
      'Краснодар',
      'Самара',
      'Уфа',
      'Ростов-на-Дону',
    ],
    Беларусь: ['Минск', 'Гомель', 'Могилёв', 'Витебск', 'Гродно', 'Брест'],
    Украина: ['Киев', 'Харьков', 'Одесса', 'Днепр', 'Львов'],
    Азербайджан: ['Баку', 'Гянджа', 'Сумгаит'],
    Армения: ['Ереван', 'Гюмри', 'Ванадзор'],
    Грузия: ['Тбилиси', 'Батуми', 'Кутаиси'],
    Китай: ['Пекин', 'Шанхай', 'Урумчи', 'Гуанчжоу'],
    Турция: ['Анкара', 'Стамбул', 'Измир', 'Анталья'],
    ОАЭ: ['Абу-Даби', 'Дубай', 'Шарджа'],
    США: ['Вашингтон', 'Нью-Йорк', 'Лос-Анджелес', 'Чикаго'],
    Другое: ['Другой город'],
  };

  await prisma.country.createMany({
    data: Object.keys(citiesByCountry).map((name) => ({ name })),
    skipDuplicates: true,
  });

  const countries = await prisma.country.findMany();
  const countryIdByName = new Map(
    countries.map((country) => [country.name, country.id]),
  );

  await prisma.city.createMany({
    data: Object.entries(citiesByCountry).flatMap(([countryName, cities]) => {
      const countryId = countryIdByName.get(countryName);
      if (!countryId) {
        return [];
      }
      return cities.map((name) => ({ name, countryId }));
    }),
    skipDuplicates: true,
  });

  console.log('Reference data seeded successfully!');

  await seedAdmin(prisma);
  await seedEmployees(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
