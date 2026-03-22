'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { Loader2, Store } from 'lucide-react';
import { motion } from 'framer-motion';

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
        role: (session.user as any).role || 'BUYER',
      });
    } else {
      setUser(null);
    }
  }, [session]);

  // Client-side route protection — only protect /dashboard
  useEffect(() => {
    if (!loading) {
      const authPaths = ['/login', '/register', '/auth'];
      const isAuthPage = authPaths.some(p => pathname.startsWith(p));

      if (!session && pathname.startsWith('/dashboard')) {
        router.push('/auth');
      } else if (session && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [session, loading, pathname, router]);

  const login = (newUser: User) => {
    setUser(newUser);
    router.push('/dashboard');
  };

  const logout = async () => {
    setUser(null);
    await signOut({ callbackUrl: '/auth' });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-green-200">
            <Store className="text-white w-8 h-8" />
          </div>
          <p className="text-gray-400 font-bold text-sm tracking-widest uppercase mb-4">MangoSpace</p>
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
