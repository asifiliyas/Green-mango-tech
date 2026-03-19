import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { role } = await req.json();
    if (!role || !['BUYER', 'SELLER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.email! },
      data: { role: role as any },
    });

    return NextResponse.json({ success: true, role: updatedUser.role }, { status: 200 });
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
