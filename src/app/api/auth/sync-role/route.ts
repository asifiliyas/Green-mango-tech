import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await req.json();
    if (!role || !['BUYER', 'SELLER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: role as any }
    });

    return NextResponse.json({ message: 'Role synchronized', role }, { status: 200 });
  } catch (error) {
    console.error('Role sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
