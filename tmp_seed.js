const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password, name: 'System Admin', role: 'ADMIN' },
    create: {
      email: 'admin@test.com',
      name: 'System Admin',
      password,
      role: 'ADMIN',
    },
  });

  // 2. Seller
  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: { password, name: 'Pro Publisher', role: 'SELLER' },
    create: {
      email: 'seller@test.com',
      name: 'Pro Publisher',
      password,
      role: 'SELLER',
    },
  });

  // 3. Buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: { password, name: 'SEO Agency', role: 'BUYER' },
    create: {
      email: 'buyer@test.com',
      name: 'SEO Agency',
      password,
      role: 'BUYER',
    },
  });

  // 4. Sample Site
  // Check if TechCrunch exists by URL (since not unique, we just find first)
  const existingSite = await prisma.website.findFirst({ where: { url: 'https://techcrunch.com' } });
  if (!existingSite) {
    await prisma.website.create({
      data: {
        url: 'https://techcrunch.com',
        category: 'Technology',
        da: 92,
        dr: 88,
        traffic: 500000,
        price: 199,
        status: 'APPROVED',
        sellerId: seller.id
      }
    });
  }

  console.log('Seeding successful!');
  console.log('Admin URL: http://localhost:3000/auth (Admin Card)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
