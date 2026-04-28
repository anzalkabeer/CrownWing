"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Declare Razorpay globally
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

function parsePrice(p: string): number {
  return parseInt(p.replace(/[^0-9]/g, ""), 10) || 0;
}
function formatPrice(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

export default function PaymentPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const router = useRouter();

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => {
        if (d.carts) {
          // Using the active cart from the new multi-cart architecture
          const active = d.carts.find((c: any) => c.id === d.activeCartId);
          if (active && active.items) setItems(active.items);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const subtotal = items.reduce((s, i) => s + parsePrice(i.price) * i.quantity, 0);

  const handlePayment = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setPaymentError("");

    try {
      // 1. Create order on backend
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, totalAmount: subtotal }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const { razorpayOrderId, amount, currency } = data;

      // 2. Initialize Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: amount,
        currency: currency,
        name: "CrownWing",
        description: "Premium Furniture Order",
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok) {
              router.push("/profile"); // Redirect to profile/orders page on success
            } else {
              setPaymentError(verifyData.error || "Payment verification failed. Please contact support.");
            }
          } catch (err) {
            setPaymentError("An error occurred during verification. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "CrownWing User", // Can be dynamically filled
          email: "user@example.com",
        },
        theme: {
          color: "#c9a45c", // Gold accent
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            setPaymentError("Payment was cancelled. You can try again.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any){
        setIsProcessing(false);
        setPaymentError(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();

    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="velvet-bg min-h-screen font-body-md text-body-md selection:bg-primary-container selection:text-on-primary-container">
      <div className="glow-sapphire"></div>
      <div className="glow-gold"></div>
      
      <main className="w-full max-w-[1200px] mx-auto px-gutter py-section-padding pt-32">
        <header className="mb-stack-lg">
          <h1 className="font-h1 text-h1 text-on-background font-light">Secure Checkout</h1>
        </header>
        
        <div className="flex flex-col lg:flex-row gap-stack-md lg:gap-stack-lg items-start">
          {/* Left Column: Form (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col gap-stack-md">
            
            {/* 1. Payment Method */}
            <section className="glass-card rounded-xl p-stack-md">
              <h2 className="font-h3 text-h3 text-on-background mb-stack-md">Payment Method</h2>
              <div className="flex flex-col gap-stack-sm">
                <label className="flex items-center p-stack-sm rounded-lg cursor-pointer bg-secondary-container/20 border border-secondary transition-colors">
                  <input defaultChecked className="appearance-none w-4 h-4 border border-secondary rounded-full mr-4 flex-shrink-0 relative focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface" name="payment_method" type="radio" value="credit_card" />
                  <span className="flex flex-col flex-grow">
                    <span className="font-label-sm text-label-sm text-on-background">Credit Card</span>
                  </span>
                  <span className="material-symbols-outlined text-secondary ml-4" style={{ fontVariationSettings: "'FILL' 0" }}>check_circle</span>
                </label>
                
                <label className="flex items-center p-stack-sm rounded-lg cursor-pointer border border-transparent hover:border-outline-variant transition-colors">
                  <input className="appearance-none w-4 h-4 border border-outline rounded-full mr-4 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface" name="payment_method" type="radio" value="upi" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">UPI</span>
                </label>
                
                <label className="flex items-center p-stack-sm rounded-lg cursor-pointer border border-transparent hover:border-outline-variant transition-colors">
                  <input className="appearance-none w-4 h-4 border border-outline rounded-full mr-4 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface" name="payment_method" type="radio" value="net_banking" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Net Banking</span>
                </label>
              </div>
            </section>

            {/* 2. Card Details */}
            <section className="glass-card rounded-xl p-stack-md">
              <h2 className="font-h3 text-h3 text-on-background mb-stack-md">Card Details</h2>
              <div className="flex flex-col gap-stack-md">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.1em]" htmlFor="card_number">Card Number</label>
                  <input className="glass-input w-full py-2 px-1 transition-colors" id="card_number" placeholder="0000 0000 0000 0000" type="text" />
                </div>
                <div className="flex gap-stack-md">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.1em]" htmlFor="expiry">Expiry Date</label>
                    <input className="glass-input w-full py-2 px-1 transition-colors" id="expiry" placeholder="MM/YY" type="text" />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.1em]" htmlFor="cvv">CVV</label>
                    <input className="glass-input w-full py-2 px-1 transition-colors" id="cvv" placeholder="123" type="text" />
                  </div>
                </div>
              </div>
              <div className="mt-stack-md p-stack-sm bg-secondary-container/20 border border-secondary-container rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 0" }}>info</span>
                <p className="font-body-md text-body-md text-secondary text-sm">Payment gateway integration in progress...</p>
              </div>
            </section>

            {/* 3. Delivery Address */}
            <section className="glass-card rounded-xl p-stack-md">
              <h2 className="font-h3 text-h3 text-on-background mb-stack-md">Delivery Address</h2>
              <div className="flex flex-col gap-stack-md">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.1em]" htmlFor="full_name">Full Name</label>
                  <input className="glass-input w-full py-2 px-1 transition-colors" id="full_name" type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.1em]" htmlFor="address">Address</label>
                  <textarea className="glass-input w-full py-2 px-1 transition-colors resize-none" id="address" rows={3}></textarea>
                </div>
                <div className="flex gap-stack-md">
                  <div className="flex flex-col gap-2 flex-grow">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.1em]" htmlFor="city">City</label>
                    <input className="glass-input w-full py-2 px-1 transition-colors" id="city" type="text" />
                  </div>
                  <div className="flex flex-col gap-2 w-1/3">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.1em]" htmlFor="pin">PIN Code</label>
                    <input className="glass-input w-full py-2 px-1 transition-colors" id="pin" type="text" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Summary (35% Sticky) */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-stack-lg">
            <section className="glass-card rounded-xl p-stack-md flex flex-col gap-stack-md">
              <h2 className="font-h3 text-h3 text-on-background">Order Summary</h2>
              
              {/* Scrolling Items */}
              <div className="flex flex-col gap-stack-sm max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border-b border-outline-variant pb-stack-md">
                {isLoading ? (
                  <div className="h-16 bg-surface-container rounded-xl animate-pulse" />
                ) : items.length === 0 ? (
                  <p className="font-label-sm text-label-sm text-on-surface-variant text-center py-4">Your cart is empty.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-[60px] h-[60px] rounded bg-surface-container overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-body-md text-body-md text-on-background truncate">{item.name}</h4>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-body-md text-body-md text-on-background">{item.price}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="flex flex-col gap-2 py-stack-sm border-b border-outline-variant">
                <div className="flex justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant">Subtotal</span>
                  <span className="font-body-md text-body-md text-on-background">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant">Delivery</span>
                  <span className="font-body-md text-body-md text-secondary">Free Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant">Tax</span>
                  <span className="font-body-md text-body-md text-on-background">—</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-stack-sm">
                <span className="font-body-lg text-body-lg text-on-background">Total</span>
                <span className="font-h2 text-h2 text-primary-container">{formatPrice(subtotal)}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-stack-sm mt-stack-sm">
                {paymentError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-body-md">
                    {paymentError}
                  </div>
                )}
                
                <button 
                  onClick={handlePayment}
                  disabled={isProcessing || items.length === 0}
                  className={`metallic-gold-btn w-full py-4 rounded-lg flex items-center justify-center gap-2 transition-all ${isProcessing || items.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                >
                  <span className="material-symbols-outlined text-surface text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>{isProcessing ? 'hourglass_empty' : 'lock'}</span>
                  <span className="font-label-sm text-label-sm text-surface tracking-widest uppercase">
                    {isProcessing ? 'PROCESSING...' : `PAY ${formatPrice(subtotal)}`}
                  </span>
                </button>
                
                <Link href="/cart" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors text-center mt-2 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_left</span>
                  BACK TO CART
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
