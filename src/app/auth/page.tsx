'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams } from 'next/navigation';
import { Store, Loader2, KeyRound, Mail, User as UserIcon, ShieldCheck, ShoppingCart, ArrowRight, ArrowLeft, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required').optional(),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

type SelectedRole = 'ADMIN' | 'BUYER' | 'SELLER' | null;

export default function AuthPage() {
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams.get('role') as SelectedRole;
    const mode = searchParams.get('mode');
    if (role === 'BUYER' || role === 'SELLER') {
      setSelectedRole(role);
      if (mode === 'register') setIsLogin(false);
    }
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleAdminLogin = async () => {
    setAdminLoading(true);
    await signIn('credentials', {
      email: 'admin@test.com',
      password: 'password123',
      callbackUrl: '/dashboard'
    });
  };

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password
        });
        if (result?.error) throw new Error('Invalid email or password');
        if (selectedRole) localStorage.setItem('pending_role', selectedRole);
        window.location.href = '/dashboard';
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, email: data.email, password: data.password, role: selectedRole })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Signup failed');
        await signIn('credentials', { email: data.email, password: data.password, callbackUrl: '/dashboard' });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    if (selectedRole) {
      localStorage.setItem('pending_role', selectedRole);
    }
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  // ─── STEP 1: ROLE SELECTION ───
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-200">
            <Store className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome to MangoSpace</h1>
          <p className="text-gray-500 mt-2 font-medium">Choose how you want to continue</p>
        </motion.div>

        <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Admin Card */}
          <motion.button
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={handleAdminLogin}
            disabled={adminLoading}
            className="group bg-white rounded-3xl border-2 border-gray-100 p-8 text-center hover:border-gray-900 hover:shadow-xl transition-all flex flex-col items-center gap-4 disabled:opacity-70"
          >
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Admin</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Pre-configured account for reviewing the platform
            </p>
            {adminLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            ) : (
              <span className="text-[10px] font-black text-gray-900 bg-gray-100 px-4 py-1.5 rounded-full uppercase tracking-widest group-hover:bg-gray-900 group-hover:text-white transition-colors">
                Instant Access
              </span>
            )}
          </motion.button>

          {/* Buyer Card */}
          <motion.button
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onClick={() => setSelectedRole('BUYER')}
            className="group bg-white rounded-3xl border-2 border-gray-100 p-8 text-center hover:border-green-500 hover:shadow-xl transition-all flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-green-200">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Buyer</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Browse publishers &amp; place guest post orders
            </p>
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-4 py-1.5 rounded-full uppercase tracking-widest group-hover:bg-green-500 group-hover:text-white transition-colors">
              Sign In / Register
            </span>
          </motion.button>

          {/* Seller Card */}
          <motion.button
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            onClick={() => setSelectedRole('SELLER')}
            className="group bg-white rounded-3xl border-2 border-gray-100 p-8 text-center hover:border-blue-500 hover:shadow-xl transition-all flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Seller</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              List your websites &amp; earn from guest posts
            </p>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest group-hover:bg-blue-500 group-hover:text-white transition-colors">
              Sign In / Register
            </span>
          </motion.button>
        </div>
      </div>
    );
  }

  // ─── STEP 2: AUTH FORM (for Buyer / Seller) ───
  const accentColor = selectedRole === 'BUYER' ? 'green' : 'blue';  const testEmail = isLogin 
    ? (selectedRole === 'BUYER' ? 'buyer@test.com' : 'seller@test.com') 
    : 'NAME@EXAMPLE.COM';
  const testPassword = isLogin ? 'password123' : '••••••••';


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
        
        {/* Back Button */}
        <button onClick={() => { setSelectedRole(null); setError(null); }} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 font-bold mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Change role
        </button>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200 border border-gray-100 overflow-hidden">
          
          {/* Role Badge Header */}
          <div className={`px-8 py-5 flex items-center gap-3 ${accentColor === 'green' ? 'bg-green-50 border-b border-green-100' : 'bg-blue-50 border-b border-blue-100'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentColor === 'green' ? 'bg-green-500' : 'bg-blue-500'}`}>
              {selectedRole === 'BUYER' ? <ShoppingCart className="w-5 h-5 text-white" /> : <Truck className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">{selectedRole} Portal</h2>
              <p className="text-xs text-gray-500 font-medium">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
            </div>
          </div>

          {/* Tab Toggle */}
          <div className="flex border-b border-gray-100">
            <button onClick={() => { setIsLogin(true); setError(null); }} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${isLogin ? `text-${accentColor}-600 border-b-2 border-${accentColor}-500` : 'text-gray-300 hover:text-gray-500'}`}>
              Sign In
            </button>
            <button onClick={() => { setIsLogin(false); setError(null); }} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? `text-${accentColor}-600 border-b-2 border-${accentColor}-500` : 'text-gray-300 hover:text-gray-500'}`}>
              Register
            </button>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold text-center">{error}</motion.div>
              )}

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 block mb-2">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input {...register('name')} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" placeholder="Your full name" />
                    </div>
                    {errors.name && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 block mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input {...register('email')} type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" placeholder={testEmail} />
                </div>
                {errors.email && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 block mb-2">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input {...register('password')} type="password" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" placeholder={testPassword} />
                </div>
                {errors.password && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.password.message}</p>}
              </div>

              <button
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-black text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98] ${accentColor === 'green' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="h-px flex-1 bg-gray-100"></div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">or</span>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>

            {/* Google */}
            <button onClick={handleGoogleSignIn} className="w-full py-3.5 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-bold text-gray-600">Continue with Google</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
