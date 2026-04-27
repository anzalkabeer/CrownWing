"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("cw-splash-shown")) return;

    setVisible(true);
    sessionStorage.setItem("cw-splash-shown", "1");

    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 45%, #0d2847 0%, #06080f 100%)",
          }}
        >
          {/* Pulsing glow behind logo */}
          <div className="absolute w-48 h-48 rounded-full bg-[#c9a45c]/20 animate-pulse-glow" />

          {/* Logo */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-[#c9a45c]/20 shadow-[0_0_40px_rgba(201,164,92,0.1)] animate-breath">
              <img
                src="/logo-crownwing.jpg"
                alt="CrownWing"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#c9a45c] tracking-[0.08em] font-light">
              Crownwing
            </h1>
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-12 flex flex-col items-center gap-3">
            <span className="text-[#c9a45c]/60 text-[10px] uppercase tracking-[0.3em]">
              Refining Experience
            </span>
            <div className="w-12 h-[1px] bg-[#1a2240] rounded-full overflow-hidden">
              <div className="h-full bg-[#c9a45c] animate-progress" />
            </div>
          </div>

          {/* EST badge (desktop only) */}
          <span className="hidden md:block absolute top-8 left-10 text-[#8b92a8]/20 text-[10px] tracking-[0.3em] uppercase">
            Est. 2024
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
