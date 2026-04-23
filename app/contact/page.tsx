"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0a0a08] text-[#f0e6d3] relative overflow-hidden font-sans selection:bg-[#c9a45c] selection:text-[#0a0a08] flex items-center justify-center">
      <nav className="absolute top-0 left-0 w-full px-8 py-10 lg:px-16 z-50 flex justify-between items-center pointer-events-none">
        <Link href="/" className="pointer-events-auto inline-flex items-center gap-3 text-[rgba(240,230,211,0.5)] hover:text-[#c9a45c] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span className="font-medium tracking-[0.15em] uppercase text-xs">Return</span>
        </Link>
        <div className="pointer-events-auto flex items-center gap-8">
          <div className="text-lg font-medium tracking-[0.25em] text-[#f0e6d3] font-serif uppercase">
            CrownWing
          </div>
          <Link href="/auth" className="text-xs font-medium tracking-[0.15em] text-[#c9a45c] uppercase hover:text-white transition-colors">
            Sign Up
          </Link>
        </div>
      </nav>

      <motion.div 
        className="w-full max-w-2xl px-10 py-32 z-10 relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <h1 className="text-4xl lg:text-6xl font-serif text-white mb-6 font-light text-center">Contact Us</h1>
        <p className="text-center text-[rgba(240,230,211,0.6)] font-light leading-loose mb-16 px-4">
          We would love to hear from you. Whether you have inquiries regarding a piece in our collection, or require assistance with an existing order, please reach out.
        </p>
        
        <form className="flex flex-col gap-12" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col lg:flex-row gap-12">
             <input type="text" placeholder="Name" className="flex-1 bg-transparent border-b border-[rgba(240,230,211,0.15)] pb-4 text-white font-light text-lg placeholder-[rgba(240,230,211,0.3)] focus:outline-none focus:border-[#c9a45c] transition-colors" />
             <input type="email" placeholder="Email" className="flex-1 bg-transparent border-b border-[rgba(240,230,211,0.15)] pb-4 text-white font-light text-lg placeholder-[rgba(240,230,211,0.3)] focus:outline-none focus:border-[#c9a45c] transition-colors" />
          </div>
          <input type="text" placeholder="Subject" className="w-full bg-transparent border-b border-[rgba(240,230,211,0.15)] pb-4 text-white font-light text-lg placeholder-[rgba(240,230,211,0.3)] focus:outline-none focus:border-[#c9a45c] transition-colors" />
          <textarea placeholder="Message" rows={5} className="w-full bg-transparent border-b border-[rgba(240,230,211,0.15)] pb-4 text-white font-light text-lg placeholder-[rgba(240,230,211,0.3)] focus:outline-none focus:border-[#c9a45c] transition-colors resize-y leading-relaxed" />
          
          <div className="flex justify-center mt-6">
            <button type="submit" className="relative group bg-transparent border border-[#c9a45c] text-[#c9a45c] py-5 px-16 rounded-full font-medium uppercase tracking-[0.2em] text-xs transition-colors hover:text-[#0a0a08] hover:bg-[#c9a45c]">
               Send Message
            </button>
          </div>
        </form>
      </motion.div>

      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(201,164,92,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(106,160,132,0.03)_0%,transparent_70%)] pointer-events-none" />
    </main>
  );
}
