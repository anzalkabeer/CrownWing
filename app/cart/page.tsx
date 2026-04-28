"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

interface CartItem {
  id: number;
  name: string;
  slug: string;
  description: string;
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

export default function CartPage() {
  const { carts, activeCartId, activeCart, isLoading, removeFromCart, addToCart, switchCart, createNewCart } = useCart();
  const [newCartName, setNewCartName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const items = activeCart?.items || [];

  const updateQuantity = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      await removeFromCart(item.id);
    } else {
      await addToCart(item, delta);
    }
  };

  const handleCreateCart = async () => {
    if (newCartName.trim()) {
      await createNewCart(newCartName.trim());
      setNewCartName("");
      setIsCreating(false);
    }
  };

  const subtotal = items.reduce((s, i) => s + parsePrice(i.price) * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  if (isLoading) {
    return <div className="min-h-screen velvet-bg"></div>;
  }

  return (
    <div className="velvet-bg min-h-screen text-app-text-light font-body-md relative overflow-x-hidden flex flex-col pt-32 pb-24 px-6 md:px-12">
      <main className="relative z-10 w-full max-w-[1200px] mx-auto flex-1 flex flex-col">
        {/* Multi-Cart Selector UI */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-app-border pb-6">
          <div className="flex items-center gap-4">
            <span className="font-label-sm text-app-text-muted uppercase tracking-[0.15em]">Select Cart:</span>
            <select
              value={activeCartId}
              onChange={(e) => switchCart(e.target.value)}
              className="bg-surface-container-high border border-app-gold/20 rounded-lg px-4 py-2 text-app-gold font-h3 outline-none focus:border-app-gold"
            >
              {carts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {isCreating ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCartName}
                  onChange={(e) => setNewCartName(e.target.value)}
                  placeholder="New Cart Name"
                  className="bg-surface-container-high border border-app-gold/20 rounded-lg px-3 py-1.5 text-app-text-light text-sm outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCart()}
                />
                <button onClick={handleCreateCart} className="text-app-gold hover:text-white transition-colors">Save</button>
                <button onClick={() => setIsCreating(false)} className="text-app-text-muted hover:text-white transition-colors">Cancel</button>
              </div>
            ) : (
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1 text-app-gold text-[11px] uppercase tracking-[0.1em] hover:text-white transition-colors px-3 py-2 border border-app-gold/20 rounded-lg"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
                Create New Cart
              </button>
            )}
          </div>
        </div>

        <div className="mb-12">
          <h1 className="font-h1 text-h1 text-app-text-light font-light mb-2">{activeCart?.name || "Your Selection"}</h1>
          <p className="font-body-lg text-body-lg text-app-text-muted">
            {count > 0 ? `${count} items in your collection` : "Your collection awaits"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          {/* Left Column: Cart Items */}
          <div className="w-full lg:w-[65%] flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <div className="bg-app-card/70 border border-app-border rounded-2xl p-10 text-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-app-btn-bg flex items-center justify-center mx-auto mb-4 border border-app-gold/20">
                    <span className="material-symbols-outlined text-app-text-muted text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_bag</span>
                  </div>
                  <h3 className="font-h3 text-app-text-muted text-xl mb-2">Nothing here yet</h3>
                  <p className="text-app-text-muted/50 text-sm mb-6">Your curated selection awaits.</p>
                  <Link href="/#collection" className="inline-flex items-center gap-2 text-app-gold text-[11px] uppercase tracking-[0.15em] font-semibold hover:text-[#e0c88a] transition-colors">
                    Explore Collection <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className="bg-app-card/70 border border-app-border rounded-2xl p-5 backdrop-blur-sm flex items-center gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-surface-container-high border border-app-gold/20">
                      <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <Link href={`/product/${item.slug}`} className="hover:text-app-gold transition-colors">
                        <h3 className="font-h3 text-app-text-light text-xl mb-1">{item.name}</h3>
                      </Link>
                      <p className="font-body-md text-[11px] uppercase tracking-[0.15em] text-app-text-muted line-clamp-1">{item.description}</p>
                    </div>
                    
                    <div className="text-right flex flex-col items-end gap-3 shrink-0">
                      <div className="text-app-gold font-body-lg text-lg">{item.price}</div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-app-btn-bg rounded-xl border border-app-border">
                          <button onClick={() => updateQuantity(item, -1)} aria-label="Decrease quantity" className="w-8 h-8 flex items-center justify-center text-app-text-light hover:text-app-gold transition-colors">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>remove</span>
                          </button>
                          <span className="w-6 text-center font-body-md text-app-text-light text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item, 1)} aria-label="Increase quantity" className="w-8 h-8 flex items-center justify-center text-app-text-light hover:text-app-gold transition-colors">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} aria-label="Remove item" className="text-app-danger hover:text-red-400 transition-colors p-1">
                          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-32">
            <div className="bg-app-card/70 border border-app-border rounded-2xl p-8 backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-app-gold/5 to-transparent pointer-events-none"></div>
              
              <h2 className="font-h3 text-app-text-light text-2xl mb-8 border-b border-app-border pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center font-body-md text-app-text-light">
                  <span className="text-app-text-muted">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center font-body-md">
                  <span className="text-app-text-muted">Concierge Delivery</span>
                  <span className="text-app-gold font-medium tracking-wide">FREE</span>
                </div>
                <div className="flex justify-between items-center font-body-md text-app-text-light">
                  <span className="text-app-text-muted">Tax</span>
                  <span>—</span>
                </div>
              </div>
              
              <div className="border-t border-app-border my-6"></div>
              
              <div className="flex justify-between items-end mb-10">
                <span className="font-body-md text-app-text-light text-lg">Total</span>
                <span className="font-h2 text-3xl font-bold text-app-gold tracking-tight">{formatPrice(subtotal)}</span>
              </div>
              
              <Link href="/payment" className={`w-full bg-gradient-to-r from-app-gold-dark to-app-gold text-app-navy rounded-full py-4 px-6 uppercase font-label-sm tracking-[0.15em] transition-opacity shadow-[0_0_20px_rgba(201,164,92,0.2)] mb-6 flex justify-center items-center gap-2 ${items.length > 0 ? "hover:opacity-90" : "opacity-50 pointer-events-none"}`}>
                PROCEED TO CHECKOUT
              </Link>
              
              <div className="flex justify-center items-center gap-2 text-app-text-muted opacity-80">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0" }}>lock</span>
                <span className="font-label-sm text-[10px] uppercase tracking-[0.1em]">SECURE ENCRYPTED</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
