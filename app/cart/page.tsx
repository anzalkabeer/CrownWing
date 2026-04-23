"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

const slideUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }),
  exit: { opacity: 0, x: -50, filter: "blur(4px)", transition: { duration: 0.4 } }
};

export default function CartPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setItems(data.items);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const subtotal = items.reduce((acc, item) => {
    const priceStr = item.price || "0";
    const price = Number(priceStr.replace(/[^\d]/g, ""));
    const qty = item.quantity || 1;
    return acc + (price * qty);
  }, 0);

  const delivery = subtotal > 0 ? 1500 : 0;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + delivery + tax;

  const formatPrice = (val: number) => {
    return `Rs. ${val.toLocaleString("en-IN")}`;
  };

  const handleRemove = async (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/cart?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = () => {
    setIsExiting(true);
    window.setTimeout(() => {
      router.push("/payment");
    }, 500);
  };

  return (
    <motion.main
      className="min-h-[calc(100vh-40px)] w-full bg-[#0c120e] text-[#dfe4dd] overflow-hidden relative flex flex-col font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Top Navbar matched from screenshot */}
      <nav className="h-[80px] w-full px-6 lg:px-12 flex justify-between items-center border-b border-transparent">
        <Link href="/" className="flex items-center gap-3 font-serif text-2xl tracking-[0.15em] text-[#e9c349] uppercase font-semibold hover:opacity-80 transition-opacity">
          <img 
            src="/logo-crownwing.jpg" 
            alt="CrownWing Logo" 
            className="w-10 h-10 rounded-full object-cover shadow-[0_0_15px_rgba(233,193,118,0.2)]" 
          />
          CrownWing
        </Link>
        <div className="hidden md:flex items-center gap-10">
          {["Living", "Dining", "Bedroom", "Office", "Atelier"].map((link) => (
            <a key={link} className="text-[13px] text-[#8a9a8f] hover:text-[#e9c349] transition-colors cursor-pointer font-medium tracking-wide">
              {link}
            </a>
          ))}
          <Link href="/auth" className="text-[13px] text-[#e9c349] hover:opacity-80 transition-opacity font-medium tracking-wide">Sign Up</Link>
        </div>
        <div className="flex items-center gap-6">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#e9c349" className="text-[#e9c349] cursor-pointer hover:opacity-80 transition-opacity">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e9c349" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-[6px] -right-[8px] bg-[#e9c349] text-[#0a0f0b] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e9c349" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:opacity-80 transition-opacity">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-[1300px] mx-auto px-6 lg:px-12 pt-12 pb-24">
        
        {/* Header section */}
        <div className="mb-10">
          <h1 className="text-lg md:text-xl text-[#cdcfcb] font-serif mb-1 tracking-wide">Your Selection</h1>
          <p className="text-[14px] text-[#8a9a8f] font-light">Refined pieces curated for your living sanctuary.</p>
        </div>

        {/* Content Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* Left Column Component - Items */}
          <div className="space-y-6">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  custom={index}
                  variants={slideUpVariant}
                  initial="hidden"
                  animate={isExiting ? "exit" : "visible"}
                  exit="exit"
                  className="bg-[#0c1812] rounded-[24px] p-5 pr-8 flex flex-col md:flex-row gap-6 relative shadow-sm border border-transparent"
                >
                  {/* Image Container */}
                  <div className="w-[160px] h-[160px] rounded-[16px] overflow-hidden flex-shrink-0 bg-black shadow-inner">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90" />
                  </div>
                  
                  {/* Details Container */}
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div className="pr-12">
                      <h2 className="font-serif text-[#e9c349] text-[18px] mb-[6px] tracking-wide">{item.name}</h2>
                      <p className="text-[#8a9a8f] text-[13px] italic font-light truncate">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mt-6">
                      <div className="flex items-center bg-[#070e0a] rounded-full border border-[#16291e] px-4 py-2 gap-4">
                        <button className="text-[#647c6b] hover:text-[#e9c349] transition-colors pb-[1px]" aria-label="Decrease quantity">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span className="text-[#cdcfcb] text-[13px] w-4 text-center">{(item.quantity || 1) < 10 ? `0${item.quantity || 1}` : item.quantity || 1}</span>
                        <button className="text-[#647c6b] hover:text-[#e9c349] transition-colors pb-[1px]" aria-label="Increase quantity">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                      </div>
                      
                      <button className="flex items-center gap-2 text-[#8a9a8f] hover:text-[#cdcfcb] transition-colors text-[13px]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Save for later
                      </button>
                    </div>
                  </div>

                  {/* Absolute positioning for close and price as shown in design */}
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-6 right-6 text-[#647c6b] hover:text-[#e9c349] transition-colors" 
                    aria-label="Remove item"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>

                  <div className="absolute right-6 top-[50%] -translate-y-[50%] flex h-full items-center md:items-center">
                    <span className="font-serif text-[#cdcfcb] text-[15px]">{item.price}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {!isLoading && items.length === 0 && (
              <div className="bg-[#0c1812] rounded-[24px] p-10 flex flex-col items-center justify-center text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#647c6b" strokeWidth="1.5" className="mb-4">
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p className="text-[#8a9a8f] text-lg font-serif">Your cart is currently empty.</p>
              </div>
            )}
            {isLoading && (
              <div className="bg-[#0c1812] rounded-[24px] p-10 flex items-center justify-center text-center h-[200px]">
                <p className="text-[#8a9a8f] text-sm animate-pulse">Loading collection...</p>
              </div>
            )}
          </div>

          {/* Right Column Component - Summary */}
          <div className="space-y-6 flex flex-col">
            <motion.div 
              custom={2}
              variants={slideUpVariant}
              initial="hidden"
              animate={isExiting ? "exit" : "visible"}
              className="bg-[#0c1812] rounded-[24px] p-8 shadow-sm flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif text-[34px] text-[#cdcfcb] mb-8 tracking-wide">Order Summary</h3>
                
                <div className="space-y-5 text-[28px] max-w-full overflow-hidden">
                  <div className="flex justify-between items-center text-[#8a9a8f]">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#8a9a8f]">
                    <span>Concierge Delivery</span>
                    <span>{formatPrice(delivery)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#8a9a8f]">
                    <span>Tax (Estimated)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 flex justify-between items-center bg-transparent">
                  <span className="text-[#cdcfcb] font-serif text-[32px]">Total</span>
                  <span className="text-[#e9c349] font-serif text-[32px] tracking-wide font-medium">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-12 w-full flex flex-col items-center gap-6">
                <button 
                  onClick={handleCheckout}
                  disabled={isExiting || items.length === 0}
                  className="w-full bg-[#d6b05e] hover:bg-[#ebd085] disabled:opacity-50 disabled:cursor-not-allowed text-[#392e10] font-sans text-[24px] uppercase tracking-[0.1em] font-bold py-6 rounded-[30px] shadow-[0_0_30px_rgba(214,176,94,0.35)] hover:shadow-[0_0_40px_rgba(214,176,94,0.5)] outline outline-1 outline-offset-2 outline-transparent hover:outline-[#e9c349]/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Proceed to Checkout
                </button>
                
                <div className="flex items-center gap-2 text-[#647c6b] text-[22px] tracking-wider uppercase font-medium">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Secure Encrypted Payment
                </div>
              </div>
            </motion.div>

            {/* Member Rewards Component */}
            <motion.div
              custom={3}
              variants={slideUpVariant}
              initial="hidden"
              animate={isExiting ? "exit" : "visible"}
              className="bg-[#0c1812] rounded-[24px] p-6 shadow-sm flex items-center justify-between cursor-pointer group border border-transparent hover:border-[#16291e] transition-colors"
            >
              <div className="flex items-start gap-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#e9c349" className="text-[#e9c349] mt-1 shrink-0">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7" stroke="#0a0f0b" strokeWidth="3" strokeLinecap="round"></line>
                </svg>
                <div className="flex flex-col">
                  <span className="text-[#cdcfcb] text-[14px] mb-1">Member Rewards</span>
                  <span className="text-[#8a9a8f] text-[13px] leading-relaxed">
                    You'll earn {Math.round(subtotal / 10)} points on this order.
                  </span>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#647c6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:stroke-[#e9c349] group-hover:translate-x-1 transition-all">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </motion.div>
          </div>
          
        </div>
      </div>
    </motion.main>
  );
}

