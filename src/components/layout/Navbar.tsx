'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, LayoutDashboard, Store, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-green-500/30">
                <Store className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-400">
                MangoSpace
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-green-600 flex items-center space-x-1 text-sm font-medium transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                {user.role === 'BUYER' && (
                  <Link href="/marketplace" className="text-gray-600 hover:text-green-600 flex items-center space-x-1 text-sm font-medium transition-colors">
                    <Store className="w-4 h-4" />
                    <span>Marketplace</span>
                  </Link>
                )}
                <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  href="/login"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
