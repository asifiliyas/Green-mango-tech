import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'System Admin',
      password,
      role: 'ADMIN',
    },
  });

  // 2. Create Seller
  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      email: 'seller@test.com',
      name: 'Pro Publisher',
      password,
      role: 'SELLER',
    },
  });

  // 3. Create Buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: {},
    create: {
      email: 'buyer@test.com',
      name: 'SEO Agency',
      password,
      role: 'BUYER',
    },
  });

  console.log('Database seeded successfully with test accounts!');
  console.log('------------------------------------------------');
  console.log('Admin: admin@test.com / password123');
  console.log('Seller: seller@test.com / password123');
  console.log('Buyer: buyer@test.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
