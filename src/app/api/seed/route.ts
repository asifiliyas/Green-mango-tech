import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const password = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    await prisma.user.upsert({
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
    await prisma.user.upsert({
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
    await prisma.user.upsert({
      where: { email: 'buyer@test.com' },
      update: {},
      create: {
        email: 'buyer@test.com',
        name: 'SEO Agency',
        password,
        role: 'BUYER',
      },
    });

    // 4. Create a Sample Approved Website for the Buyer to see
    const testSeller = await prisma.user.findUnique({ where: { email: 'seller@test.com' } });
    if (testSeller) {
      await prisma.website.upsert({
        where: { url: 'https://techcrunch.com' },
        update: {},
        create: {
          url: 'https://techcrunch.com',
          category: 'Technology',
          da: 92,
          dr: 88,
          traffic: 500000,
          price: 199,
          status: 'APPROVED',
          sellerId: testSeller.id
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully with test accounts and sample data.',
      accounts: [
        { email: 'admin@test.com', password: 'password123', role: 'ADMIN' },
        { email: 'seller@test.com', password: 'password123', role: 'SELLER' },
        { email: 'buyer@test.com', password: 'password123', role: 'BUYER' }
      ]
    }, { status: 200 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Database seeding failed.' }, { status: 500 });
  }
}
