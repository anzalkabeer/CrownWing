"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/auth");
          throw new Error("Not logged in");
        }
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (isLoading) {
    return <div className="min-h-screen velvet-bg"></div>;
  }

  if (!user) return null;

  return (
    <div className="velvet-bg min-h-screen text-on-surface relative overflow-x-hidden selection:bg-primary-container/30 selection:text-primary flex flex-col">
      {/* Deep Velvet Texture Background Overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 velvet-grain opacity-10 mix-blend-overlay" data-alt="deep navy blue velvet texture"></div>
        <div className="absolute inset-0 bg-secondary-container/5 mix-blend-soft-light"></div>
      </div>

      {/* Main Content Canvas */}
      <main className="max-w-[900px] mx-auto pt-32 pb-40 md:pb-32 px-6 w-full flex flex-col items-center flex-grow">
        {/* Top: Profile Section */}
        <section className="flex flex-col items-center text-center mb-16 w-full">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-surface-highest to-surface border-[0.5px] border-primary/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
              <span className="font-h3 text-h3 text-primary tracking-widest">{user.name.substring(0, 2).toUpperCase()}</span>
            </div>
            {/* Sapphire Status Dot */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#2d5f9a] rounded-full border-2 border-surface shadow-[0_0_10px_rgba(45,95,154,0.6)]"></div>
          </div>
          <h1 className="font-h2 text-h2 text-on-surface mb-2">{user.name}</h1>
          <p className="font-body-md text-body-md text-on-secondary-container mb-6">{user.email}</p>
          <div className="inline-block px-4 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container-low/50">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em]">MEMBER</p>
          </div>
        </section>

        {/* Middle: Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
          {/* Card 1: My Orders */}
          <Link href="#" className="group relative flex flex-col p-6 rounded-2xl bg-[#0c1022]/60 border border-[#1a2240] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center mb-6 border border-outline-variant/20 shadow-inner">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_bag</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-2">My Orders</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">Track your recent acquisitions and view past bespoke purchases.</p>
            <div className="font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-[0.15em] flex items-center gap-1 group-hover:text-primary transition-colors">
              <span>COMING SOON</span>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>chevron_right</span>
            </div>
          </Link>

          {/* Card 2: Wishlist */}
          <Link href="#" className="group relative flex flex-col p-6 rounded-2xl bg-[#0c1022]/60 border border-[#1a2240] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center mb-6 border border-outline-variant/20 shadow-inner">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-2">Wishlist</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">Curate your personal collection of desired pieces and experiences.</p>
            <div className="font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-[0.15em] flex items-center gap-1 group-hover:text-primary transition-colors">
              <span>COMING SOON</span>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>chevron_right</span>
            </div>
          </Link>

          {/* Card 3: Addresses */}
          <Link href="#" className="group relative flex flex-col p-6 rounded-2xl bg-[#0c1022]/60 border border-[#1a2240] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center mb-6 border border-outline-variant/20 shadow-inner">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>location_on</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-2">Addresses</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">Manage your primary residences and delivery destinations seamlessly.</p>
            <div className="font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-[0.15em] flex items-center gap-1 group-hover:text-primary transition-colors">
              <span>COMING SOON</span>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>chevron_right</span>
            </div>
          </Link>

          {/* Card 4: Rewards */}
          <Link href="#" className="group relative flex flex-col p-6 rounded-2xl bg-[#0c1022]/60 border border-[#1a2240] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center mb-6 border border-outline-variant/20 shadow-inner">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-2">Rewards</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">Access exclusive privileges, early access, and membership benefits.</p>
            <div className="font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-[0.15em] flex items-center gap-1 group-hover:text-primary transition-colors">
              <span>COMING SOON</span>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>chevron_right</span>
            </div>
          </Link>
        </section>

        {/* Bottom: Sign Out */}
        <section className="w-full flex flex-col items-center">
          <div className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent mb-10"></div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 rounded-full border border-outline-variant/20 bg-surface-container-low/30 backdrop-blur-sm font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant hover:text-error hover:border-error/30 hover:bg-error/5 transition-all duration-300 group">
            <span className="material-symbols-outlined text-lg group-hover:text-error transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>logout</span>
            <span>SIGN OUT</span>
          </button>
        </section>
      </main>
    </div>
  );
}
