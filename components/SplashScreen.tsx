"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Show splash screen for 2.5 seconds to build anticipation
    const timer = setTimeout(() => {
      setShow(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0f0b] overflow-hidden"
        >
          {/* Background Textures */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#062c1e_0%,_#090f0c_50%,_#0f1512_100%)] opacity-80" />
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: "url('/noise.svg')" }}
            />
          </div>

          {/* Ambient Golden Glow behind Logo */}
          <div className="absolute z-10 w-96 h-96 rounded-full bg-[#d6b05e] opacity-40 blur-[80px] animate-pulse-glow" style={{ boxShadow: "0 0 120px rgba(233, 193, 118, 0.3)" }} />

          {/* Central Branding Element */}
          <div className="relative z-20 flex flex-col items-center gap-2 animate-breath">
            <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center overflow-hidden rounded-full">
              {/* Golden specular highlight */}
              <div className="absolute inset-0 rounded-full border-t border-l border-[#d6b05e]/30 pointer-events-none" />
              <img
                src="/logo-crownwing.jpg"
                alt="Crownwing Logo"
                className="w-full h-full object-cover drop-shadow-[0_0_25px_rgba(233,193,118,0.4)]"
              />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-[#e9c349] mt-6 tracking-widest drop-shadow-[0_2px_10px_rgba(233,193,118,0.2)]">
              Crownwing
            </h1>
          </div>

          {/* Loading UI: Minimal & High-End */}
          <div className="absolute bottom-20 left-0 right-0 z-30 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-[#e9c349]/60 tracking-[0.25em] uppercase">
                Refining Experience
              </span>
            </div>
            {/* Fine Golden Progress Line */}
            <div className="relative w-48 h-[1px] bg-white/10 overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-[#e9c349] animate-progress shadow-[0_0_8px_rgba(233,193,118,0.8)]" />
            </div>
          </div>

          {/* Decorative Elements for Depth */}
          <div className="absolute top-8 left-8 z-40 opacity-20 hidden md:block">
            <span className="font-sans text-sm text-[#e9c349] tracking-widest border-l border-[#e9c349]/30 pl-6 py-1">
              EST. 2024
            </span>
          </div>
          <div className="absolute top-8 right-8 z-40 opacity-20 hidden md:block">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e9c349" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
