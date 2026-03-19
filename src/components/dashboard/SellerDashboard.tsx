'use client';

import { useEffect, useState } from 'react';
import { Loader2, DollarSign, PlusCircle, CheckCircle, ShoppingBag, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newSite, setNewSite] = useState({ url: '', category: '', da: '', dr: '', traffic: '', price: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [webRes, ordRes] = await Promise.all([
          fetch('/api/websites?my=true', { cache: 'no-store' }),
          fetch('/api/orders', { cache: 'no-store' })
        ]);
        const webData = await webRes.json();
        const ordData = await ordRes.json();
        setWebsites(webData.websites || []);
        setOrders(ordData.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading('Submitting website...');
    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSite)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Website submitted for Admin approval!', { id: t });
        setWebsites(prev => [data.website, ...prev]);
        setNewSite({ url: '', category: '', da: '', dr: '', traffic: '', price: '' });
      } else {
        toast.error(data.error || 'Submission failed.', { id: t });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { id: t });
      console.error(err);
    }
  };

  const handleOrderAction = async (orderId: string, status: string, liveLink?: string) => {
    const t = toast.loading('Updating...');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, liveLink })
      });
      if (res.ok) {
        toast.success(liveLink ? 'Live link submitted!' : `Order ${status.toLowerCase()}`, { id: t });
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, liveLink: liveLink || o.liveLink } : o));
      } else {
        toast.error('Failed to update.', { id: t });
      }
    } catch (err) {
      toast.error('Network error.', { id: t });
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-green-500 w-8 h-8" /></div>;
  }

  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const earnings = completedOrders.reduce((acc: number, curr: any) => acc + curr.price, 0);
  const pendingOrders = orders.filter(o => ['PAID', 'PROCESSING', 'APPROVED'].includes(o.status));
  const approvedSites = websites.filter(w => w.status === 'APPROVED');
  const pendingSites = websites.filter(w => w.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-11 h-11 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Earnings</p>
            <p className="text-xl font-black text-gray-900">₹{earnings.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-11 h-11 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Orders</p>
            <p className="text-xl font-black text-gray-900">{pendingOrders.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Sites</p>
            <p className="text-xl font-black text-gray-900">{approvedSites.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-11 h-11 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed</p>
            <p className="text-xl font-black text-gray-900">{completedOrders.length}</p>
          </div>
        </div>
      </div>

      {/* My Listings — scrollable */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">My Listings</h3>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {websites.length} total • {pendingSites.length} pending
          </span>
        </div>
        {websites.length === 0 ? (
          <p className="text-gray-400 text-center py-10 text-sm font-medium">You haven't listed any websites yet.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest sticky top-0">
                <tr>
                  <th className="px-6 py-3">Website</th>
                  <th className="px-6 py-3 text-center">DA / DR</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {websites.map((site: any) => (
                  <tr key={site.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm font-bold text-gray-900">{site.url}</td>
                    <td className="px-6 py-3 text-xs text-gray-400 font-bold text-center">{site.da} / {site.dr}</td>
                    <td className="px-6 py-3 text-sm font-bold text-green-600 text-right">₹{site.price}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        site.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                        site.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {site.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incoming Orders — scrollable */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Incoming Orders</h3>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-center py-10 text-sm font-medium">No orders yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto scrollbar-thin p-4 space-y-3">
            {orders.map((order: any, i: number) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                key={order.id} className="border border-gray-100 p-4 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{order.website?.url}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Target: <a href={order.targetUrl} className="text-blue-600 hover:underline font-bold" target="_blank" rel="noreferrer">{order.targetUrl}</a>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                      From: {order.buyer?.name} ({order.buyer?.email})
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-black text-green-600">₹{order.price}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${
                      order.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                      order.status === 'APPROVED' ? 'bg-blue-50 text-blue-700' :
                      order.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                      'bg-orange-50 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {order.status === 'PAID' && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
                    <button onClick={() => handleOrderAction(order.id, 'PROCESSING')} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg text-xs font-bold transition-colors">
                      Accept
                    </button>
                    <button onClick={() => handleOrderAction(order.id, 'REJECTED')} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-xs font-bold transition-colors">
                      Reject
                    </button>
                  </div>
                )}

                {order.status === 'PROCESSING' && (
                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
                    {order.liveLink ? (
                      <p className="text-[10px] text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" /> Link Submitted: {order.liveLink}
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          id={`link-${order.id}`}
                          type="url"
                          placeholder="https://your-site.com/guest-post"
                          className="flex-1 border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const link = (document.getElementById(`link-${order.id}`) as HTMLInputElement)?.value;
                            if (!link) return toast.error('Please enter the live link');
                            handleOrderAction(order.id, 'PROCESSING', link);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-green-700 transition-colors"
                        >
                          Submit Link
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Website */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5">Add New Website Listing</h3>
        <form onSubmit={handleAddWebsite} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="url" placeholder="Website URL (e.g. https://example.com)" value={newSite.url} onChange={e => setNewSite({...newSite, url: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <input required type="text" placeholder="Category (e.g. Tech, Finance)" value={newSite.category} onChange={e => setNewSite({...newSite, category: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <input type="number" placeholder="Domain Authority (DA)" value={newSite.da} onChange={e => setNewSite({...newSite, da: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <input type="number" placeholder="Domain Rating (DR)" value={newSite.dr} onChange={e => setNewSite({...newSite, dr: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <input type="number" placeholder="Monthly Traffic" value={newSite.traffic} onChange={e => setNewSite({...newSite, traffic: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <input required type="number" placeholder="Price (₹)" value={newSite.price} onChange={e => setNewSite({...newSite, price: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <div className="md:col-span-2 flex justify-center mt-2">
            <button type="submit" className="w-fit px-12 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl py-3.5 flex items-center gap-2 transition-all shadow-xl shadow-green-200 active:scale-95">
              <PlusCircle className="w-5 h-5" /> Submit Website
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
