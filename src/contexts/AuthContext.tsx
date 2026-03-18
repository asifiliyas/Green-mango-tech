'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut, signIn } from "next-auth/react"

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const loading = status === "loading";
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: (session.user as any).id,
        name: session.user.name || "",
        email: session.user.email || "",
        role: (session.user as any).role,
      });
    } else {
      setUser(null);
    }
  }, [session]);

  useEffect(() => {
    if (!loading) {
      if (!session && (pathname.startsWith('/dashboard') || pathname === '/marketplace')) {
        router.push('/login');
      } else if (session && (pathname === '/login' || pathname === '/register')) {
        router.push('/dashboard');
      }
    }
  }, [session, loading, pathname, router]);

  const login = (newUser: User) => {
    // This is primarily for manual credential login if needed, 
    // but in NextAuth we usually let the session handle state.
    setUser(newUser);
    router.push('/dashboard');
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
