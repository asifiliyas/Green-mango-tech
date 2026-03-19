import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only admins can update website status.' }, { status: 403 });
    }

    const { status } = await req.json();

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const id = (await params).id;

    const website = await prisma.website.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ website }, { status: 200 });
  } catch (error) {
    console.error('Update website error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
