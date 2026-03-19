import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const minDa = searchParams.get('minDa');
    const myOnly = searchParams.get('my') === 'true';
    const status = searchParams.get('status');

    const where: any = {};

    if (myOnly && session) {
      // Seller's own listing — show everything regardless of status
      where.sellerId = session.userId;
    } else if (status === 'PENDING' && session?.role === 'ADMIN') {
      // Admin review view
      where.status = 'PENDING';
    } else {
      // Public Marketplace: APPROVED + not already bought
      // A site is "bought" ONLY if it has an order PAID / PROCESSING / COMPLETED.
      // Orders that are PENDING (payment initiated but never completed) or
      // REJECTED must NOT hide the site.
      where.status = 'APPROVED';
      where.orders = {
        none: {
          status: { in: ['PAID', 'PROCESSING', 'COMPLETED'] }
        }
      };
    }

    if (category) where.category = category;
    if (minDa) where.da = { gte: parseInt(minDa) };

    const websites = await prisma.website.findMany({
      where,
      include: {
        seller: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ websites }, { status: 200 });
  } catch (error) {
    console.error('Fetch websites error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized. Only sellers can add websites.' }, { status: 403 });
    }

    const { url, category, da, dr, traffic, price } = await req.json();

    if (!url || !category || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const website = await prisma.website.create({
      data: {
        url,
        category,
        da: parseInt(da) || 0,
        dr: parseInt(dr) || 0,
        traffic: parseInt(traffic) || 0,
        price: parseFloat(price),
        sellerId: session.userId,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ website }, { status: 201 });
  } catch (error) {
    console.error('Create website error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
