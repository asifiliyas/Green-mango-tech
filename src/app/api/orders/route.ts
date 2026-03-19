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
      orders = await prisma.order.findMany({
        where: {
          website: { sellerId: userId }
        },
        include: {
          buyer: { select: { name: true, email: true } },
          website: { select: { url: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
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

    const order = await prisma.order.create({
      data: {
        websiteId,
        buyerId: session.userId,
        targetUrl,
        content,
        price: website.price,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
