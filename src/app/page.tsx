'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col justify-center bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-gradient-to-b from-green-50 to-white -z-10 blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase mb-8 inline-block">
            The Premium Guest Posting Network
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
            Elevate Your SEO with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              High-Quality Backlinks
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            Connect with premium publishers, build authority, and climb the search rankings. The marketplace for real traffic and genuine outreach.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 select-none">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-10 py-5 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg transition-transform hover:-translate-y-1 shadow-2xl flex items-center justify-center space-x-3"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-10 py-5 bg-gray-900 hover:bg-black text-white rounded-full font-bold text-lg transition-transform hover:-translate-y-1 shadow-2xl flex items-center justify-center space-x-3"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-gray-900 text-gray-900 rounded-full font-bold text-lg transition-transform hover:-translate-y-1 shadow-xl flex items-center justify-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
          <p className="mt-8 text-sm text-gray-500 font-medium">Connect with premium publishers and scale your SEO authority.</p>




        </motion.div>

        {/* Features grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Vast Publisher Network</h3>
            <p className="text-gray-500">Access thousands of verified websites across hundreds of niches. Real sites with real traffic.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Transparent Metrics</h3>
            <p className="text-gray-500">Filter by DA, DR, and monthly traffic. Make data-driven decisions for your SEO campaigns.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Workflow</h3>
            <p className="text-gray-500">End-to-end management from order to publishing. Built-in escrow and strict quality QA.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
