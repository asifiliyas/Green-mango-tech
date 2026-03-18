'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (err: string | null) => {
    switch (err) {
      case 'Configuration': return 'There is a problem with the server configuration. Please ensure all environment variables (Google OAuth, NextAuth Secret) are set correctly.';
      case 'AccessDenied': return 'Access was denied. You may not have the required permissions or your sign-in was canceled.';
      case 'Verification': return 'The verification link has expired or has already been used.';
      default: return 'An unexpected authentication error occurred. Please try again or contact support.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center"
      >
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-2">Authentication Error</h2>
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-8">
          <p className="text-sm font-medium text-red-800 leading-relaxed">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/login" 
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <p className="text-xs text-gray-400 font-medium">Error Code: {error || 'Unknown'}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">Loading error details...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
