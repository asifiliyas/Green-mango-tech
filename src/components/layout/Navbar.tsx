'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, Store, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2 group">
              <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-green-500/30">
                <Store className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-400">
                MangoSpace
              </span>
            </Link>

            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link 
                href="/marketplace" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors ${
                  isActive('/marketplace') ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'
                }`}
              >
                Marketplace
              </Link>
              {user && (
                <Link 
                  href="/dashboard" 
                  className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors ${
                    isActive('/dashboard') ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white ${
                    user.role === 'ADMIN' ? 'bg-gray-900' : user.role === 'SELLER' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>{user.role[0]}</div>
                  <span className="text-xs font-bold text-gray-700 hidden sm:inline">{user.name}</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
