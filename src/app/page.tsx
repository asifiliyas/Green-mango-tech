'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Store, ShoppingBag, ArrowRight, ShieldCheck, Globe, Zap, Loader2, BarChart3 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Hero */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-bold mb-6 border border-green-100 uppercase tracking-widest">
            <Zap className="w-4 h-4 fill-green-500" />
            <span>Guest Posting Marketplace</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-none mb-6">
            Everything you need<br/> 
            <span className="text-green-600">for Guest Posting</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-12 font-medium leading-relaxed">
            Connect Buyers with premium Publishers. Browse verified websites, place secure orders, and grow your online authority.
          </p>

          {user ? (
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link href="/auth" className="inline-flex items-center gap-2 px-10 py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-2xl shadow-green-100">
              Get Started <ArrowRight className="w-6 h-6" />
            </Link>
          )}
        </motion.div>
      </section>

      {/* Workflow */}
      <section className="py-24 bg-gray-50 border-y border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">How It Works</h2>
          <p className="text-gray-500 font-medium">A transparent, end-to-end marketplace workflow</p>
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sellers List Sites</h3>
            <p className="text-sm text-gray-500 font-medium">Publishers add websites with DA, DR, and traffic metrics. Status starts as Pending.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Admin Reviews</h3>
            <p className="text-sm text-gray-500 font-medium">Admin approves or rejects listings and orders. Quality control for both sides.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Buyers Order</h3>
            <p className="text-sm text-gray-500 font-medium">Buyers browse approved sites, place orders, and track status from Pending to Completed.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
