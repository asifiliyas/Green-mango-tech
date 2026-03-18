'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Loader2, Filter, Search, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function MarketplacePage() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ordering modal
  const [orderSite, setOrderSite] = useState<any | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [content, setContent] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/websites')
      .then(res => res.json())
      .then(data => {
        setWebsites(data.websites || []);
        setLoading(false);
      });
  }, []);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSite) return;
    
    setPlacingOrder(true);
    try {
      // 1. Create Razorpay Payment Intent (Order) from Backend
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: orderSite.id })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to initialize payment');
        setPlacingOrder(false);
        return;
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "MangoSpace Marketplace",
        description: `Guest Post on ${orderSite.url}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment and Create Order Record
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                websiteId: orderSite.id,
                targetUrl: targetUrl,
                content: content
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setOrderSite(null);
              setTargetUrl('');
              setContent('');
              router.push('/dashboard?status=success');
            } else {
              alert(verifyData.error || 'Payment verification failed');
            }
          } catch (err) {
            console.error(err);
            alert('Something went wrong during payment verification');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#22c55e",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        alert("Payment Failed. Reason: " + response.error.description);
      });
      razorpay.open();
    } catch (err) {
      console.error(err);
      alert('Network error initializing payment');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return <div className="min-h-[70vh] flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-green-500" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={() => setIsRazorpayLoaded(true)}
      />
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Store className="w-8 h-8 text-green-600" />
            Publisher Marketplace
          </h1>
          <p className="text-gray-700 mt-2 font-medium">Discover verified publishers to buy high-quality backlinks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {websites.map((site, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            key={site.id} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            <div className="flex-1 mb-6 md:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{site.url}</h3>
                <span title="Verified Publisher">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </span>
              </div>
              <p className="text-sm text-gray-800 mb-4 font-bold inline-block bg-gray-100 px-3 py-1 rounded-full">{site.category}</p>
              
              <div className="flex gap-6 mt-2">
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Domain Authority</p>
                  <p className="text-lg font-black text-gray-900">{site.da}</p>
                </div>
                <div className="w-px bg-gray-300"></div>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Domain Rating</p>
                  <p className="text-lg font-black text-gray-900">{site.dr}</p>
                </div>
                <div className="w-px bg-gray-300"></div>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Traffic</p>
                  <p className="text-lg font-black text-gray-900">{site.traffic}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
              <p className="text-3xl font-extrabold text-green-600 mb-4">${site.price}</p>
              {user?.role === 'BUYER' ? (
                <button 
                  onClick={() => setOrderSite(site)}
                  className="w-full md:w-auto px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-md transition-all transform hover:scale-105"
                >
                  Buy Post
                </button>
              ) : (
                <button disabled className="w-full md:w-auto px-8 py-3 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed">
                  Log in as Buyer
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {websites.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No websites found</h3>
            <p className="text-gray-500 mt-2">Check back later for new publisher listings.</p>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {orderSite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">Place Order</h3>
                <p className="text-sm text-gray-700 font-medium">{orderSite.url}</p>
              </div>
              <p className="text-2xl font-black text-green-600">${orderSite.price}</p>
            </div>
            
            <form onSubmit={handleOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Target URL</label>
                <input 
                  required type="url" 
                  value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
                  placeholder="https://your-website.com/page"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article Content (Optional)</label>
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  placeholder="Paste your guest post article content here, or leave blank if you want the publisher to write it."
                  rows={4}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none placeholder:text-gray-400"
                ></textarea>
                <p className="text-xs text-gray-600 mt-1 font-medium">If you don't provide content, publisher might charge extra for writing.</p>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setOrderSite(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" disabled={placingOrder || !isRazorpayLoaded}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : !isRazorpayLoaded ? (
                    'Loading Payment...'
                  ) : (
                    'Confirm Order'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
