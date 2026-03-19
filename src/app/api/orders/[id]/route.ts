import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';
import { OrderStatus } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, liveLink } = await req.json();

    const id = (await params).id;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { website: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isAdmin = session.role === 'ADMIN';
    const isSeller = session.role === 'SELLER' && (order.sellerId === session.userId || order.website.sellerId === session.userId);

    // Permission Logic based on Business Workflow:
    // 1. Sellers can only move PAID -> PROCESSING or submit a liveLink
    // 2. ONLY Admin can mark an order as COMPLETED or reject/approve at initial stages.
    
    if (isSeller) {
      // Seller can accept a paid order or update the liveLink
      if (status && ![OrderStatus.PROCESSING, OrderStatus.REJECTED].includes(status as any)) {
        return NextResponse.json({ error: 'Sellers can only move orders to PROCESSING or REJECTED' }, { status: 403 });
      }
    } else if (isAdmin) {
      // Admin can do anything
    } else {
      return NextResponse.json({ error: 'Unauthorized to update this order' }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (liveLink) updateData.liveLink = liveLink;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
