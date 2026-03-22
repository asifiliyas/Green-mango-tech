'use client';

import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import SellerDashboard from '@/components/dashboard/SellerDashboard';
import BuyerDashboard from '@/components/dashboard/BuyerDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Show loader until the session has resolved AND the user object is set.
  // This is the only guard needed — no localStorage, no reloads, no race conditions.
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-600 mt-2 font-medium">
          Here is what's happening in your <span className="text-green-600 font-bold">{user.role.toLowerCase()}</span> account.
        </p>
      </div>

      {user.role === 'ADMIN' && <AdminDashboard />}
      {user.role === 'SELLER' && <SellerDashboard />}
      {user.role === 'BUYER' && <BuyerDashboard />}
    </div>
  );
}
