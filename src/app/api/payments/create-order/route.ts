import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSession } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized. Only buyers can initialize payments.' }, { status: 403 });
    }

    const { websiteId } = await req.json();
    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    });

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    // Razorpay expectations: amount in smallest currency unit (paise for INR, cents for USD)
    // For this example, we treat USD prices as cents.
    const amountInCents = Math.round(website.price * 100);

    const options = {
      amount: amountInCents,
      currency: "USD",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 500 });
  }
}
