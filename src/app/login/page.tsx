'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Store, Loader2, KeyRound, Mail, ShieldCheck, ShoppingCart, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { signIn as googleSignIn } from 'next-auth/react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const handleQuickLogin = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Login failed');
      }

      login(result.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 overflow-hidden no-scrollbar">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full space-y-4 bg-white p-6 rounded-3xl shadow-xl border border-gray-100"
      >
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex justify-center items-center mb-2">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-1 text-gray-600 text-sm font-medium">
            Sign in to access your dashboard
          </p>
        </div>

        <form id="login-form" className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className="pl-10 block w-full border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow sm:text-sm border"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className="pl-10 block w-full border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow sm:text-sm border"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
            ) : (
              'Sign In'
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="bg-white px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => googleSignIn('google', { callbackUrl: '/dashboard/setup' })}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
              Create one now
            </Link>
          </p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-center text-[10px] text-gray-500 mb-3 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-gray-300"></span>
            Test Accounts
            <span className="w-8 h-px bg-gray-300"></span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@test.com')}
              className="flex flex-col items-center justify-center p-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-800 transition-all group shadow-sm hover:shadow-md"
            >
              <ShieldCheck className="w-5 h-5 text-slate-800 mb-1 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-extrabold text-slate-800">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('seller@test.com')}
              className="flex flex-col items-center justify-center p-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-800 transition-all group shadow-sm hover:shadow-md"
            >
              <UserCheck className="w-5 h-5 text-slate-800 mb-1 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-extrabold text-slate-800">Seller</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('buyer@test.com')}
              className="flex flex-col items-center justify-center p-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-800 transition-all group shadow-sm hover:shadow-md"
            >
              <ShoppingCart className="w-5 h-5 text-slate-800 mb-1 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-extrabold text-slate-800">Buyer</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
