"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { activeCart } = useCart();
  
  const cartCount = activeCart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  return (
    <>
      <header className="fixed top-0 w-full z-50 h-20 bg-slate-950 border-b border-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center">
        <div className="flex justify-between items-center px-12 w-full max-w-[1440px] mx-auto">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-serif tracking-[0.25em] text-amber-500 hover:text-amber-400 transition-all duration-500 ease-out">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
            <span className="font-h3 text-h3 text-primary">CROWNWING</span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-gutter">
            <Link 
              href="/" 
              className={`text-[10px] uppercase tracking-widest font-medium transition-all duration-500 ease-out ${
                pathname === "/" 
                  ? "text-amber-500 border-b border-amber-500 pb-1" 
                  : "text-slate-400 hover:text-amber-400 scale-95 opacity-80"
              }`}
            >
              COLLECTION
            </Link>
            <Link 
              href="/contact" 
              className={`text-[10px] uppercase tracking-widest font-medium transition-all duration-500 ease-out ${
                pathname === "/contact" 
                  ? "text-amber-500 border-b border-amber-500 pb-1" 
                  : "text-slate-400 hover:text-amber-400 scale-95 opacity-80"
              }`}
            >
              CONTACT
            </Link>
          </nav>

          {/* Trailing Icons */}
          <div className="flex items-center gap-stack-sm text-amber-500">
            <Link href="/cart" className="relative p-2 hover:text-amber-400 transition-all duration-500 ease-out flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-on-primary text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/profile" className="p-2 hover:text-amber-400 transition-all duration-500 ease-out flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>person</span>
            </Link>
          </div>
        </div>
      </header>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 pb-safe bg-slate-950 border-t border-[#c9a45c]/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center transition-all font-sans text-[10px] uppercase tracking-[0.2em] font-medium gap-1 w-1/4 ${
            pathname === "/" ? "text-[#c9a45c] relative after:content-[''] after:absolute after:-bottom-2 after:w-1 after:h-1 after:bg-[#c9a45c] after:rounded-full scale-95 duration-200" : "text-slate-500 hover:text-slate-200"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: pathname === "/" ? "'FILL' 1" : "'FILL' 0" }}>home</span>
          <span>Home</span>
        </Link>
        <Link 
          href="/cart" 
          className={`flex flex-col items-center justify-center transition-all font-sans text-[10px] uppercase tracking-[0.2em] font-medium gap-1 w-1/4 ${
            pathname === "/cart" ? "text-[#c9a45c] relative after:content-[''] after:absolute after:-bottom-2 after:w-1 after:h-1 after:bg-[#c9a45c] after:rounded-full scale-95 duration-200" : "text-slate-500 hover:text-slate-200"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: pathname === "/cart" ? "'FILL' 1" : "'FILL' 0" }}>shopping_cart</span>
          <span>Cart</span>
        </Link>
        <Link 
          href="/contact" 
          className={`flex flex-col items-center justify-center transition-all font-sans text-[10px] uppercase tracking-[0.2em] font-medium gap-1 w-1/4 ${
            pathname === "/contact" ? "text-[#c9a45c] relative after:content-[''] after:absolute after:-bottom-2 after:w-1 after:h-1 after:bg-[#c9a45c] after:rounded-full scale-95 duration-200" : "text-slate-500 hover:text-slate-200"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: pathname === "/contact" ? "'FILL' 1" : "'FILL' 0" }}>support_agent</span>
          <span>Concierge</span>
        </Link>
        <Link 
          href="/profile" 
          className={`flex flex-col items-center justify-center transition-all font-sans text-[10px] uppercase tracking-[0.2em] font-medium gap-1 w-1/4 ${
            pathname === "/profile" ? "text-[#c9a45c] relative after:content-[''] after:absolute after:-bottom-2 after:w-1 after:h-1 after:bg-[#c9a45c] after:rounded-full scale-95 duration-200" : "text-slate-500 hover:text-slate-200"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: pathname === "/profile" ? "'FILL' 1" : "'FILL' 0" }}>person</span>
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
}
