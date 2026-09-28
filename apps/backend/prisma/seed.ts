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

  const demoPost = await prisma.post.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      caption: 'Atardecer en la montaña',
      authorId: admin.id,
    },
  });

  console.log(`Demo post ready: ${demoPost.id}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
