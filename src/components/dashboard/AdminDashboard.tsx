'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, Link as LinkIcon, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/websites?status=PENDING', { cache: 'no-store' }).then(res => res.json()),
      fetch('/api/orders', { cache: 'no-store' }).then(res => res.json())
    ]).then(([webData, ordData]) => {
      setWebsites(webData.websites || []);
      setOrders(ordData.orders || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleUpdateWebsite = async (id: string, status: string) => {
    const t = toast.loading('Updating site...');
    try {
      const res = await fetch(`/api/websites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Website ${status.toLowerCase()}!`, { id: t });
        setWebsites(websites.filter(w => w.id !== id));
      } else {
        toast.error('Failed to update website.', { id: t });
      }
    } catch (err) {
      toast.error('Network error.', { id: t });
      console.error(err);
    }
  };

  const handleUpdateOrder = async (id: string, status: string) => {
    const t = toast.loading('Updating order...');
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Order ${status.toLowerCase()}!`, { id: t });
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      } else {
        toast.error('Failed to update order.', { id: t });
      }
    } catch (err) {
      toast.error('Network error.', { id: t });
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-green-500 w-8 h-8" /></div>;
  }

  const ordersToReview = orders.filter(o => o.status === 'PROCESSING' && o.liveLink);

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
            <p className="text-xl font-black text-gray-900 tracking-tight">Active Orders: {orders.filter(o => ['PAID', 'PROCESSING'].includes(o.status)).length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Websites Approval Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center space-x-3">
             <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
               <AlertCircle className="w-4 h-4" />
             </div>
            <h3 className="text-lg font-bold text-gray-900">Sites Pending Review</h3>
          </div>

          {websites.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-gray-400">
              <ShieldCheck className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-sm font-medium">No websites pending approval.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-gray-100">
              {websites.map((site) => (
                <div key={site.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <LinkIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900">{site.url}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">DA: {site.da} • DR: {site.dr} • ₹{site.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateWebsite(site.id, 'APPROVED')} className="flex-1 py-2 bg-green-50 text-green-600 text-xs rounded-lg font-bold hover:bg-green-100 transition-colors">Approve</button>
                    <button onClick={() => handleUpdateWebsite(site.id, 'REJECTED')} className="flex-1 py-2 bg-red-50 text-red-600 text-xs rounded-lg font-bold hover:bg-red-100 transition-colors">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders Administration Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center space-x-3">
             <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
               <ShoppingBag className="w-4 h-4" />
             </div>
            <h3 className="text-lg font-bold text-gray-900">Manage Orders Fulfillment</h3>
          </div>

          {ordersToReview.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-sm font-medium">No orders waiting for final completion.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-gray-100">
              {ordersToReview.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{order.website?.url}</h4>
                      <div className="flex items-center gap-1 mt-1">
                         <p className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">Target: {order.targetUrl}</p>
                      </div>
                      <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-black rounded uppercase bg-blue-50 text-blue-700">IN REVIEW</span>
                    </div>
                    <p className="text-sm font-black text-green-600">₹{order.price}</p>
                  </div>

                  <div className="space-y-2">
                    <a
                      href={order.liveLink} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 text-[11px] font-black text-blue-600 bg-white border border-blue-100 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                    >
                      <LinkIcon className="w-3 h-3" /> Review Live Post Link
                    </a>
                    
                    <button
                      onClick={() => handleUpdateOrder(order.id, 'COMPLETED')}
                      className="w-full py-3 bg-gray-900 text-white text-xs font-black shadow-lg shadow-gray-200 hover:shadow-gray-300 hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-95 rounded-xl flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-3 h-3" /> Verify & Complete Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
