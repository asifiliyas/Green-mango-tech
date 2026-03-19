'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Loader2, Compass, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BuyerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
        setLoading(false);
      });
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
      case 'COMPLETED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'APPROVED': return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-orange-500" />;
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
            <p className="text-sm font-bold text-gray-600">Total Orders</p>
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
          <h3 className="text-xl font-semibold text-gray-900">Your Orders</h3>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Website</th>
                  <th className="px-6 py-4 font-medium">Target URL</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: any, index: number) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={order.id} 
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.website?.url || 'Deleted Website'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate">{order.targetUrl}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">${order.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black border ${getStatusBg(order.status)} w-fit`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </span>
                        {order.liveLink && (
                          <a href={order.liveLink} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                             <Compass className="w-3 h-3" /> View G-Post
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
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
