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

  const paidOrders       = orders.filter(o => o.status === 'PAID');
  const processingOrders = orders.filter(o => o.status === 'PROCESSING');
  const readyToVerify    = orders.filter(o => o.status === 'PROCESSING' && o.liveLink);
  const completedOrders  = orders.filter(o => o.status === 'COMPLETED');

  const statusStyle: Record<string, string> = {
    PAID:       'bg-orange-50 text-orange-700',
    PROCESSING: 'bg-blue-50 text-blue-700',
    COMPLETED:  'bg-green-50 text-green-700',
    REJECTED:   'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Sites Pending', value: websites.length, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Awaiting Seller', value: paidOrders.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ready to Verify', value: readyToVerify.length, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Completed', value: completedOrders.length, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} p-4 rounded-2xl flex flex-col gap-1`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Sites Pending Review ── */}
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
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{site.url}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                        DA: {site.da} • DR: {site.dr} • ₹{site.price}
                      </p>
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

        {/* ── All Orders Pipeline ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Order Pipeline</h3>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">All orders — verify when seller submits proof</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-sm font-medium">No orders yet.</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{order.website?.url}</h4>
                      <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                        Buyer: {order.buyer?.name} · Target: {order.targetUrl}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                      <p className="text-sm font-black text-green-600">₹{order.price}</p>
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${statusStyle[order.status] || 'bg-gray-50 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Verify action — only when seller has submitted the live link */}
                  {order.status === 'PROCESSING' && order.liveLink && (
                    <div className="mt-2 space-y-1.5">
                      <a
                        href={order.liveLink} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 text-[11px] font-black text-blue-600 bg-white border border-blue-100 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all"
                      >
                        <LinkIcon className="w-3 h-3" /> Review Live Post
                      </a>
                      <button
                        onClick={() => handleUpdateOrder(order.id, 'COMPLETED')}
                        className="w-full py-2.5 bg-gray-900 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
                      >
                        <ShieldCheck className="w-3 h-3" /> Verify & Complete
                      </button>
                    </div>
                  )}

                  {order.status === 'PROCESSING' && !order.liveLink && (
                    <p className="mt-2 text-[10px] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-medium">
                      Seller is working — waiting for live link submission
                    </p>
                  )}

                  {order.status === 'PAID' && (
                    <p className="mt-2 text-[10px] text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg font-medium">
                      Paid — waiting for seller to accept
                    </p>
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
