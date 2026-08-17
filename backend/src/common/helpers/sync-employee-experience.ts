import { PrismaService } from '../../prisma/prisma.service';

function monthsBetween(start: Date, end: Date): number {
  const years = end.getUTCFullYear() - start.getUTCFullYear();
  const months = end.getUTCMonth() - start.getUTCMonth();
  let total = years * 12 + months;
  if (end.getUTCDate() < start.getUTCDate()) {
    total -= 1;
  }
  return Math.max(0, total);
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function sumExperienceMonths(
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
      .map(normalizeName),
  );
  const now = new Date();
  let totalExperienceMonths = 0;
  let specialtyExperienceMonths = 0;

  for (const item of items) {
    const months = monthsBetween(item.startDate, item.endDate ?? now);
    totalExperienceMonths += months;
    if (item.position && specialties.has(normalizeName(item.position.name))) {
      specialtyExperienceMonths += months;
    }
  }

  return { totalExperienceMonths, specialtyExperienceMonths };
}

export async function syncEmployeeExperience(
  prisma: PrismaService,
  employeeId: number,
): Promise<void> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId },
    include: {
      position: true,
      educations: { where: { isDeleted: false } },
      workExperiences: {
        where: { isDeleted: false },
        include: { position: true },
      },
    },
  });

  if (!employee) {
    return;
  }

  const { totalExperienceMonths, specialtyExperienceMonths } =
    sumExperienceMonths(employee.workExperiences, [
      employee.position?.name,
      ...employee.educations.map((education) => education.specialty),
    ]);

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      totalExperienceMonths,
      specialtyExperienceMonths,
    },
  });
}
