import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from './../src/generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('admin123', await bcrypt.genSalt(10));

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password,
      confirmed: true,
      active: true,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin user ready: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
