'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Loader2, Compass, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BuyerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'APPROVED': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200';
      case 'APPROVED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
        </div>

        <Link href="/marketplace" className="col-span-1 md:col-span-2 bg-gradient-to-r from-green-500 to-emerald-400 p-6 rounded-2xl shadow-md text-white flex items-center justify-between hover:shadow-lg transition-all group">
          <div>
            <h3 className="text-xl font-bold mb-1">Discover Publishers</h3>
            <p className="text-white font-medium opacity-90">Browse the marketplace and place your next order.</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6 text-white" />
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Your Orders</h3>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-medium text-sm">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest sticky top-0">
                <tr>
                  <th className="px-6 py-3">Website</th>
                  <th className="px-6 py-3">Target URL</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order: any, index: number) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm font-bold text-gray-900">{order.website?.url || 'Deleted'}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 max-w-[200px] truncate">{order.targetUrl}</td>
                    <td className="px-6 py-3 text-sm font-bold text-green-600">₹{order.price}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black border w-fit ${getStatusBg(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </span>
                        {order.liveLink && (
                          <a href={order.liveLink} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                            <Compass className="w-3 h-3" /> View Post
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
