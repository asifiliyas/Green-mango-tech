import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';
import { OrderStatus, WebsiteStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      console.error('Session is null or user ID is missing during payment verification');
      return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      websiteId,
      targetUrl,
      content 
    } = body;

    // 0. Defensive check for missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !websiteId || !targetUrl) {
       console.error('Payment verification failed: Missing required fields in request body', body);
       return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // 1. Verify Payment Signature securely with crypto
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('CRITICAL: RAZORPAY_KEY_SECRET is missing from environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.error('Payment verification failed: Invalid signature');
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Atomic Transaction: Create Order & Hide Website
    console.log('Finalizing payment for website:', websiteId, 'for user:', session.userId);
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Fetch website to confirm price and get sellerId
        const website = await tx.website.findUnique({
          where: { id: websiteId }
        });

        if (!website || website.status !== WebsiteStatus.APPROVED) {
          throw new Error('Website not found or no longer available for purchase');
        }

        // Create the Order with direct sellerId mapping as requested
        const order = await tx.order.create({
          data: {
            websiteId,
            buyerId: session.userId,
            sellerId: website.sellerId, // Direct mapping from website record
            targetUrl,
            content,
            price: website.price,
            status: OrderStatus.PAID
          }
        });

        // Mark website as SOLD with type-safe Enum
        await tx.website.update({
          where: { id: websiteId },
          data: { status: WebsiteStatus.SOLD }
        });

        return order;
      });

      return NextResponse.json({ success: true, order: result }, { status: 201 });
    } catch (transactionError: any) {
      console.error('Transaction failed during payment verification:', transactionError);
      return NextResponse.json({ error: transactionError.message || 'Atomic operation failed' }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment verification route crashed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
