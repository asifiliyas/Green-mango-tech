'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, Link as LinkIcon, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/websites?status=PENDING').then(res => res.json()),
      fetch('/api/orders').then(res => res.json())
    ]).then(([webData, ordData]) => {
      setWebsites(webData.websites || []);
      setOrders(ordData.orders || []);
      setLoading(false);
    });
  }, []);

  const handleUpdateWebsite = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/websites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setWebsites(websites.filter(w => w.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrder = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-green-500 w-8 h-8" /></div>;
  }

  const pendingOrders = orders.filter(o => o.status === 'PENDING');

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-700">Admin Mode</p>
          <div className="flex gap-4 mt-1">
            <p className="text-xl font-black text-gray-900 tracking-tight">Sites: {websites.length} pending</p>
            <p className="text-xl font-black text-gray-900 tracking-tight">Orders: {pendingOrders.length} pending</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Websites Approval Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center space-x-2">
            <AlertCircle className="text-orange-500 w-5 h-5" />
            <h3 className="text-xl font-semibold text-gray-900">Sites Waiting for Approval</h3>
          </div>

          {websites.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-gray-500">
              <ShieldCheck className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-md">No websites pending approval.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {websites.map((site) => (
                <div key={site.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <LinkIcon className="w-5 h-5 text-green-500" />
                    <div>
                      <h4 className="font-bold text-md text-gray-900">{site.url}</h4>
                      <p className="text-xs text-gray-700 font-bold opacity-80 uppercase tracking-tight">DA: {site.da} • DR: {site.dr} • ${site.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateWebsite(site.id, 'APPROVED')} className="flex-1 py-1.5 bg-green-50 text-green-600 text-sm rounded font-medium">Approve</button>
                    <button onClick={() => handleUpdateWebsite(site.id, 'REJECTED')} className="flex-1 py-1.5 bg-red-50 text-red-600 text-sm rounded font-medium">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders Approval Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center space-x-2">
            <ShoppingBag className="text-blue-500 w-5 h-5" />
            <h3 className="text-xl font-semibold text-gray-900">Orders Administration</h3>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-gray-500">
              <ShoppingBag className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-md">No orders in the system.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{order.website?.url}</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{order.targetUrl}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded bg-gray-100">{order.status}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">${order.price}</p>
                    </div>
                  </div>
                  
                  {order.status === 'PENDING' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleUpdateOrder(order.id, 'APPROVED')} className="flex-1 py-1.5 bg-green-50 text-green-600 text-sm hover:bg-green-100 rounded font-medium">Approve</button>
                      <button onClick={() => handleUpdateOrder(order.id, 'REJECTED')} className="flex-1 py-1.5 bg-red-50 text-red-600 text-sm hover:bg-red-100 rounded font-medium">Reject</button>
                    </div>
                  )}
                  {order.status === 'APPROVED' && (
                    <div className="mt-3 space-y-2">
                       {order.liveLink && (
                        <a 
                          href={order.liveLink} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 animate-pulse hover:animate-none"
                        >
                          <LinkIcon className="w-3 h-3" /> Review Guest Post: {order.liveLink}
                        </a>
                      )}
                      <button onClick={() => handleUpdateOrder(order.id, 'COMPLETED')} className="w-full py-2 bg-gray-900 text-white text-xs font-black hover:bg-black rounded-lg shadow-lg shadow-gray-200 transition-all active:scale-95 disabled:opacity-50" disabled={!order.liveLink}>
                        Final Review & Complete Order
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
