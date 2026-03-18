import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized. Only buyers can place orders.' }, { status: 403 });
    }

    const { websiteId } = await req.json();

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    });

    if (!website || website.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Website not found or not approved' }, { status: 404 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    // Amount should be in paise (multiply by 100)
    const amount = Math.round(website.price * 100);

    const options = {
      amount,
      currency: "USD", // Adjust if needed to INR or based on requirement
      receipt: `receipt_${Date.now()}_${(session.user as any).id}`,
      payment_capture: 1, // Auto capture
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order, price: website.price }, { status: 200 });
  } catch (error) {
    console.error('Razorpay Create Order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
