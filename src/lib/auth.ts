import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-constants";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
}

export async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;
  
  return {
    userId: (session.user as any).id,
    name: session.user.name,
    email: session.user.email,
    role: (session.user as any).role
  };
}
