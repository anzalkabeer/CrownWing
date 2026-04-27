"use client";

import { useState } from "react";
import { Product } from "@/lib/data";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientProductPage({ product }: { product: Product }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, quantity: 1 }),
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="velvet-bg min-h-screen text-on-background font-body-md relative overflow-x-hidden flex flex-col pt-32 pb-24 px-6 md:px-12">
      <main className="relative z-10 w-full max-w-[1200px] mx-auto flex-1 flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
        
        {/* Left: Product Image */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <Link href="/#collection" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm uppercase tracking-[0.15em] mb-4">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
            Back to Collection
          </Link>
          
          <div className="relative w-full aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
            <img
              alt={product.name}
              src={product.image}
              className="w-full h-full object-cover transition-transform duration-[2s] ease-out hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col lg:pt-16">
          <div className="mb-8">
            <h1 className="font-h2 text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-on-surface mb-6 font-light">
              {product.name}
            </h1>
            <div className="font-h3 text-h3 text-primary tracking-wide mb-8">
              {product.price}
            </div>
          </div>
          
          <div className="h-px w-12 bg-primary/30 mb-8"></div>
          
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-12">
            {product.description}
          </p>

          <div className="flex flex-col gap-8">
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6 pb-8 border-b border-outline-variant/30">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.15em]">Availability</span>
                <span className="font-body-md text-on-surface">Made to Order</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.15em]">Lead Time</span>
                <span className="font-body-md text-on-surface">8-12 Weeks</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || added}
                className="flex-1 bg-gradient-to-r from-inverse-primary to-primary text-on-primary-fixed uppercase tracking-[0.2em] font-label-sm text-label-sm py-5 rounded-xl shadow-[0_10px_30px_rgba(201,164,92,0.15)] hover:shadow-[0_10px_40px_rgba(201,164,92,0.3)] border border-primary/20 transition-all duration-300 relative overflow-hidden group flex items-center justify-center gap-2"
              >
                <span className="relative z-10 font-semibold">{isAdding ? "ADDING..." : added ? "ACQUIRED" : "ADD TO COLLECTION"}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-white/40"></div>
              </button>
              
              <button
                onClick={() => router.push("/payment")}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-5 rounded-xl border border-outline-variant hover:border-primary/50 bg-surface-container-low/30 backdrop-blur-sm font-label-sm text-label-sm uppercase tracking-widest text-on-surface hover:text-primary transition-all duration-300 group"
              >
                <span>ACQUIRE NOW</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-on-surface-variant/70 mt-4">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>verified</span>
              <span className="font-label-sm text-[10px] uppercase tracking-[0.15em]">Authenticity Guaranteed</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
