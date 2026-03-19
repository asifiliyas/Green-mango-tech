'use client';

import { useEffect, useState } from 'react';
import { Store, Loader2, DollarSign, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // New Website Form state
  const [isAdding, setIsAdding] = useState(false);
  const [newSite, setNewSite] = useState({ url: '', category: '', da: '', dr: '', traffic: '', price: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [webRes, ordRes] = await Promise.all([
          fetch('/api/websites?my=true'),
          fetch('/api/orders')
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
    const loadingToast = toast.loading('Submitting website...');
    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSite)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Website submitted for Admin approval!', { id: loadingToast });
        setWebsites(prev => [data.website, ...prev]);
        setIsAdding(false);
        setNewSite({ url: '', category: '', da: '', dr: '', traffic: '', price: '' });
        router.refresh(); // Sync server state
      } else {
        toast.error(data.error || 'Submission failed.', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { id: loadingToast });
      console.error(err);
    }
  };

  const handleOrderStatus = async (orderId: string, status: string, liveLink?: string) => {
    const loadingToast = toast.loading('Updating status...');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, liveLink })
      });
      if (res.ok) {
        toast.success(`Order marked as ${status.toLowerCase()}`, { id: loadingToast });
        setOrders(orders.map(o => o.id === orderId ? { ...o, status, liveLink: liveLink || o.liveLink } : o));
        router.refresh();
      } else {
        toast.error('Failed to update status.', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Network error.', { id: loadingToast });
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-green-500 w-8 h-8" /></div>;
  }

  const earnings = orders.filter(o => o.status === 'COMPLETED').reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">${earnings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Incoming Orders</h3>
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                key={order.id} className="border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">{order.website?.url}</h4>
                    <p className="text-sm font-bold text-gray-700 mt-1">Target: <a href={order.targetUrl} className="text-blue-600 hover:underline font-bold" target="_blank" rel="noreferrer">{order.targetUrl}</a></p>
                    <p className="text-xs text-gray-600 mt-1 font-medium text-opacity-80">From: {order.buyer?.name} ({order.buyer?.email})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">${order.price}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium uppercase tracking-wider">
                      {order.status}
                    </span>
                  </div>
                </div>

                {order.status === 'PENDING' && (
                  <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                    <button onClick={() => handleOrderStatus(order.id, 'APPROVED')} className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Accept
                    </button>
                    <button onClick={() => handleOrderStatus(order.id, 'REJECTED')} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Reject
                    </button>
                  </div>
                )}
                
                {order.status === 'APPROVED' && (
                  <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Submit fulfilled guest post link</label>
                      <div className="flex gap-2">
                        <input 
                          id={`link-${order.id}`}
                          type="url" 
                          placeholder="https://test-site.com/guest-post-live" 
                          className="flex-1 border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            const link = (document.getElementById(`link-${order.id}`) as HTMLInputElement)?.value;
                            if (!link) return alert('Please enter the live link');
                            handleOrderStatus(order.id, 'APPROVED', link);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-colors"
                        >
                          Submit Link
                        </button>
                      </div>
                    </div>
                    {order.liveLink && (
                      <p className="text-[10px] text-green-600 font-bold bg-green-50 p-2 rounded-md border border-green-100 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" /> Link Submitted: {order.liveLink}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">My Listings</h3>
        </div>
        {websites.length === 0 ? (
          <p className="text-gray-500 text-center py-6 italic font-medium">You haven't added any websites yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-700 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3 text-center">DA/DR</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic transition-all">
                {websites.map((site: any) => (
                  <tr key={site.id} className="hover:bg-gray-50/50 group transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-gray-900 not-italic">{site.url}</td>
                    <td className="px-4 py-4 text-xs text-gray-400 font-black text-center group-hover:text-gray-900 transition-colors uppercase tracking-widest leading-none">{site.da}/{site.dr}</td>
                    <td className="px-4 py-4 text-sm font-black text-green-600 text-right">${site.price}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                        site.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' : 
                        site.status === 'PENDING' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-red-100 text-red-700 border-red-200'
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add New Website Listing</h3>
        </div>
        <form onSubmit={handleAddWebsite} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="url" placeholder="Website URL (e.g. https://example.com)" value={newSite.url} onChange={e => setNewSite({...newSite, url: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <input required type="text" placeholder="Category (e.g. Tech, Finance)" value={newSite.category} onChange={e => setNewSite({...newSite, category: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <input type="number" placeholder="Domain Authority (DA)" value={newSite.da} onChange={e => setNewSite({...newSite, da: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <input type="number" placeholder="Domain Rating (DR)" value={newSite.dr} onChange={e => setNewSite({...newSite, dr: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <input type="number" placeholder="Monthly Traffic" value={newSite.traffic} onChange={e => setNewSite({...newSite, traffic: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <input required type="number" placeholder="Price ($)" value={newSite.price} onChange={e => setNewSite({...newSite, price: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          
          <div className="md:col-span-2 flex justify-center mt-2">
            <button type="submit" className="w-fit px-12 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl py-3.5 flex justify-center items-center gap-2 transition-all shadow-xl shadow-green-200 active:scale-95">
              <PlusCircle className="w-5 h-5" /> Submit Website
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
