import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await req.json();
    if (!role || (role !== 'SELLER' && role !== 'BUYER' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Invalid role request' }, { status: 400 });
    }

    // Capture user record and update role if it is currently BUYER (default)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Atomic update to ensure role persistence in Neon
    await prisma.user.update({
      where: { id: user.id },
      data: { role: role as any }
    });

    return NextResponse.json({ message: 'Role synchronized successfully', role }, { status: 200 });
  } catch (error) {
    console.error('Role sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
