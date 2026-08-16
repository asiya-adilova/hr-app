import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@hr.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin123!';

export async function seedAdmin(prisma: PrismaClient): Promise<void> {
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.account.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password,
      role: 'ADMIN',
      firstName: 'Админ',
      lastName: 'Системы',
    },
    create: {
      email: ADMIN_EMAIL,
      password,
      role: 'ADMIN',
      firstName: 'Админ',
      lastName: 'Системы',
    },
  });

  console.log(`Admin account seeded: ${ADMIN_EMAIL}`);
}
