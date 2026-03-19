'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Loader2, Filter, Search, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';

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
    if (!orderSite) {
      setTargetUrl('');
      setContent('');
    }
  }, [orderSite]);

  useEffect(() => {
    fetch('/api/websites')
      .then(res => res.json())
      .then(data => {
        setWebsites(data.websites || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Check if script loaded via layout.tsx
    if ((window as any).Razorpay) {
      setIsRazorpayLoaded(true);
    } else {
      // Fallback check if script is still loading
      const interval = setInterval(() => {
        if ((window as any).Razorpay) {
          setIsRazorpayLoaded(true);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSite) return;
    
    setPlacingOrder(true);
    
    // Safety timeout: if modal doesn't open, reset state
    const timeout = setTimeout(() => {
      if (placingOrder) {
        setPlacingOrder(false);
        toast.error('Payment gateway timed out. Please refresh.');
      }
    }, 8000);

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: orderSite.id })
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to initialize payment');
        setPlacingOrder(false);
        clearTimeout(timeout);
        return;
      }
      
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        console.error('CRITICAL: NEXT_PUBLIC_RAZORPAY_KEY_ID is missing from environment.');
        toast.error('Payment configuration error. Please contact support.');
        setPlacingOrder(false);
        clearTimeout(timeout);
        return;
      }

      toast.success('Payment initialized. Opening secure gateway...');

      const options = {
        key: razorpayKey,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "MangoSpace Marketplace",
        description: `Guest Post on ${orderSite.url}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          clearTimeout(timeout);
          try {
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
              toast.success('Order placed successfully!');
              setOrderSite(null);
              setTargetUrl('');
              setContent('');
              router.push('/dashboard?status=success');
            } else {
              toast.error(verifyData.error || 'Payment verification failed');
            }
          } catch (err) {
            console.error(err);
            toast.error('Something went wrong during payment verification');
          } finally {
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#22c55e",
        },
        modal: {
          ondismiss: function() {
            setPlacingOrder(false);
            clearTimeout(timeout);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        toast.error("Payment Failed: " + response.error.description);
        setPlacingOrder(false);
        clearTimeout(timeout);
      });
      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error('Network error initializing payment');
      setPlacingOrder(false);
      clearTimeout(timeout);
    }
  };

  if (loading) {
    return <div className="min-h-[70vh] flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-green-500" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
              <p className="text-3xl font-extrabold text-green-600 mb-4">₹{site.price}</p>
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
          <div className="bg-white p-16 rounded-3xl border border-gray-100 text-center shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">All Sites Taken!</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">More publishers coming soon! Check back later for new high-quality guest posting opportunities.</p>
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
              <p className="text-2xl font-black text-green-600">₹{orderSite.price}</p>
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
              
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center mb-6">
                 <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-2">Reviewer Test Information</p>
                 <p className="text-[11px] text-gray-800 font-bold italic text-center leading-relaxed">
                   Please use Card: <span className="text-blue-600">4111 1111 1111</span> or UPI ID: <span className="text-blue-600">success@razorpay</span> for testing. No real money will be debited.
                 </p>
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setOrderSite(null)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all active:scale-95">
                  Cancel
                </button>
                <button 
                  type="submit" disabled={placingOrder || !isRazorpayLoaded}
                  className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black shadow-xl shadow-green-100 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Verify Payment...
                    </>
                  ) : !isRazorpayLoaded ? (
                    'Initializing...'
                  ) : (
                    'Confirm Payment'
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
