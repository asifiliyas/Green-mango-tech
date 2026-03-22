import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { OrderStatus, WebsiteStatus, Role } from '@prisma/client';

export async function GET() {
  try {
    const password = await bcrypt.hash('password123', 10);

    // 0. CLEAN THE DATABASE COMPLETELY FOR A FRESH START
    console.log('[Seed] Wiping existing data for professional reset...');
    await prisma.order.deleteMany();
    await prisma.website.deleteMany();

    // 1. Create/Update Admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: { role: Role.ADMIN },
      create: {
        email: 'admin@test.com',
        name: 'System Admin',
        password,
        role: Role.ADMIN,
      },
    });

    // 2. Create/Update Default Seller
    const seller = await prisma.user.upsert({
      where: { email: 'seller@test.com' },
      update: { role: Role.SELLER },
      create: {
        email: 'seller@test.com',
        name: 'Pro Publisher',
        password,
        role: Role.SELLER,
      },
    });

    // 3. Create/Update Default Buyer
    const buyer = await prisma.user.upsert({
      where: { email: 'buyer@test.com' },
      update: { role: Role.BUYER },
      create: {
        email: 'buyer@test.com',
        name: 'SEO Agency',
        password,
        role: Role.BUYER,
      },
    });

    const targetSellerId = seller.id;
    const targetSellerName = seller.name;

    // 5. Create Sample approved websites
    const sampleSites = [
      { url: 'https://techcrunch.com', category: 'Technology', da: 92, dr: 88, traffic: 500000, price: 199 },
      { url: 'https://wowscience.com', category: 'Science', da: 45, dr: 40, traffic: 25000, price: 49 },
      { url: 'https://startupblog.io', category: 'Business', da: 55, dr: 50, traffic: 80000, price: 79 },
      { url: 'https://green-mango.vercel.app/', category: 'Health', da: 30, dr: 50, traffic: 5000, price: 50 },
    ];

    for (const site of sampleSites) {
      await prisma.website.create({
        data: {
          ...site,
          status: WebsiteStatus.APPROVED,
          sellerId: targetSellerId
        }
      });
    }

    // 6. Create a test PAID order for TechCrunch - ensuring it belongs to the target seller
    const tc = await prisma.website.findFirst({ where: { url: 'https://techcrunch.com' } });
    if (tc) {
      await prisma.order.create({
        data: {
          id: 'test-order-tc-' + Date.now(),
          websiteId: tc.id,
          buyerId: buyer.id,
          sellerId: targetSellerId,
          targetUrl: 'https://my-startup.com',
          price: tc.price,
          status: OrderStatus.PAID
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database hard-reset. All test accounts and sample data restored.',
      accounts: [
        { email: admin.email, role: 'ADMIN' },
        { email: seller.email, role: 'SELLER' },
        { email: buyer.email, role: 'BUYER' },
      ]
    }, { status: 200 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
