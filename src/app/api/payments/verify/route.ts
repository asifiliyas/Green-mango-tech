import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      websiteId,
      targetUrl,
      content 
    } = await req.json();

    // 1. Verify Payment Signature securely with crypto
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature. Potential tampering detected.' }, { status: 400 });
    }

    // 2. Fetch the website to confirm price
    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    });

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    // 3. Create the Database Order record now that payment is confirmed
    const order = await prisma.order.create({
      data: {
        websiteId,
        buyerId: session.userId,
        targetUrl,
        content,
        price: website.price,
        status: 'PENDING' // Now it appears in the Seller/Admin dashboard for fulfillment
      }
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({ error: 'Internal Server Error during order finalization' }, { status: 500 });
  }
}
