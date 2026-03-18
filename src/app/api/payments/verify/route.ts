import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      websiteId,
      targetUrl,
      content
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !websiteId || !targetUrl) {
      return NextResponse.json({ error: 'Missing required payment verification fields' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET as string;

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    });

    if (!website) {
       return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    // Wrap the order creation in a Prisma Transaction as advised by Gemini to ensure atomicity
    const order = await prisma.$transaction(async (tx: any) => {
      return tx.order.create({
        data: {
          websiteId,
          buyerId: (session.user as any).id,
          targetUrl,
          content,
          price: website.price,
          status: 'PENDING'
        }
      });
    });

    return NextResponse.json({ order, message: "Payment verified successfully" }, { status: 201 });
  } catch (error) {
    console.error('Razorpay Verify Order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
