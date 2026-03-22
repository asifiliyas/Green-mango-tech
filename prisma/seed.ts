import { PrismaClient, Role, WebsiteStatus, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // 1. Wipe existing data for a clean slate
  await prisma.order.deleteMany();
  await prisma.website.deleteMany();

  // 2. Upsert test accounts (force-reset roles every time)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { role: Role.ADMIN },
    create: { email: 'admin@test.com', name: 'System Admin', password, role: Role.ADMIN },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: { role: Role.SELLER },
    create: { email: 'seller@test.com', name: 'Pro Publisher', password, role: Role.SELLER },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: { role: Role.BUYER },
    create: { email: 'buyer@test.com', name: 'SEO Agency', password, role: Role.BUYER },
  });

  // 3. Create sample approved websites under seller@test.com
  const sampleSites = [
    { url: 'https://techcrunch.com',        category: 'Technology', da: 92, dr: 88, traffic: 500000, price: 199 },
    { url: 'https://wowscience.com',         category: 'Science',    da: 45, dr: 40, traffic: 25000,  price: 49  },
    { url: 'https://startupblog.io',         category: 'Business',   da: 55, dr: 50, traffic: 80000,  price: 79  },
    { url: 'https://green-mango.vercel.app', category: 'Health',     da: 30, dr: 50, traffic: 5000,   price: 50  },
  ];

  for (const site of sampleSites) {
    await prisma.website.create({
      data: { ...site, status: WebsiteStatus.APPROVED, sellerId: seller.id },
    });
  }

  // 4. Create one PAID test order so the workflow is visible immediately
  const tc = await prisma.website.findFirst({ where: { url: 'https://techcrunch.com' } });
  if (tc) {
    await prisma.order.create({
      data: {
        websiteId: tc.id,
        buyerId:   buyer.id,
        sellerId:  seller.id,
        targetUrl: 'https://my-startup.com',
        price:     tc.price,
        status:    OrderStatus.PAID,
      },
    });
  }

  console.log('--------------------------------------------');
  console.log('Database seeded successfully.');
  console.log('Admin:  admin@test.com  / password123');
  console.log('Seller: seller@test.com / password123');
  console.log('Buyer:  buyer@test.com  / password123');
  console.log('--------------------------------------------');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
