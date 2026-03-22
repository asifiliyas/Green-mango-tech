import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = session;
    let orders;

    if (role === 'ADMIN') {
      orders = await prisma.order.findMany({
        include: {
          buyer: { select: { name: true, email: true } },
          website: { select: { url: true, category: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'SELLER') {
      console.log('[Orders API] Fetching orders for SELLER userId:', userId);
      orders = await prisma.order.findMany({
        where: {
          sellerId: userId, // Direct query on Order model as requested
          status: { in: ['PAID', 'PROCESSING', 'APPROVED', 'COMPLETED'] }
        },
        include: {
          buyer: { select: { name: true, email: true } },
          website: { select: { url: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log('[Orders API] Found', orders.length, 'orders for this seller');
    } else {
      orders = await prisma.order.findMany({
        where: { buyerId: userId },
        include: {
          website: { select: { url: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized. Only buyers can place orders.' }, { status: 403 });
    }

    const { websiteId, targetUrl, content } = await req.json();

    if (!websiteId || !targetUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    });

    if (!website || website.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Website not found or not approved' }, { status: 404 });
    }

    // Use a transaction to create the order and mark the site as SOLD atomically,
    // matching the same behaviour as the Razorpay payment verification flow.
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          websiteId,
          buyerId: session.userId,
          sellerId: website.sellerId, // required field — sourced from the website record
          targetUrl,
          content,
          price: website.price,
          status: 'PAID', // created as PAID — simulates a completed payment for demo use
        },
      });

      await tx.website.update({
        where: { id: websiteId },
        data: { status: 'SOLD' },
      });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
