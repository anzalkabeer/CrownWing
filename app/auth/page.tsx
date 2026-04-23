"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entry animation after initial mount.
    const timer = setTimeout(() => setIsVisible(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const isStrongSignupPassword = (value: string) => {
    const digitCount = (value.match(/\d/g) || []).length;
    const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    return digitCount >= 4 && hasSpecialChar && hasUppercase && hasLowercase;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLogin && !isStrongSignupPassword(password)) {
      setError(
        "Password must include at least 4 numbers, 1 special character, and both uppercase and lowercase letters."
      );
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Success, redirect to home
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f1512] text-[#dee4de] min-h-screen flex items-center justify-center overflow-x-hidden overflow-y-auto py-6 sm:py-8 font-sans relative">
      {/* Background Images & Gradients */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-40 grayscale" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')" }}
      ></div>
      <div className="fixed inset-0 z-1 bg-[radial-gradient(circle_at_50%_50%,rgba(233,193,118,0.05)_0%,transparent_70%)]"></div>
      <div className="fixed inset-0 z-1 bg-gradient-to-tr from-[#090f0c] via-transparent to-[#062c1e]/20"></div>

      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      {/* Main Auth Container */}
      <main className="relative z-10 w-full max-w-[550px] px-4">
        <div className={`bg-[#062c1e]/45 backdrop-blur-[32px] saturate-150 border-t border-l border-[#e9c176]/25 shadow-[0_4px_10px_rgba(0,0,0,0.5),0_15px_40px_rgba(6,44,30,0.45),inset_0_0_1px_rgba(233,193,118,0.12)] rounded-[36px] overflow-hidden p-8 sm:p-9 flex flex-col items-center transform transition-all duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          
          <div className="mb-8 text-center">
            <Link href="/">
              <h1 className="font-serif text-[#e9c176] mb-1 tracking-[0.2em] uppercase text-2xl hover:opacity-80 transition-opacity">Crownwing</h1>
            </Link>
            <p className="font-sans text-[#c1c8c2] uppercase tracking-widest text-[10px]">Fine Furniture Artisans</p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex w-full mb-8 border-b border-[#414844]/30">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 pb-3 font-sans text-[22px] font-semibold transition-all duration-300 ${isLogin ? 'text-[#e9c176] border-b-2 border-[#e9c176]' : 'text-[#c1c8c2]/50 hover:text-[#e9c176]'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 pb-3 font-sans text-[22px] font-semibold transition-all duration-300 ${!isLogin ? 'text-[#e9c176] border-b-2 border-[#e9c176]' : 'text-[#c1c8c2]/50 hover:text-[#e9c176]'}`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full mb-6 p-3 bg-red-900/30 border border-red-500/30 rounded text-red-200 text-xs text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <div className="space-y-1">
                <label className="font-sans font-bold text-[#e9c176]/70 uppercase text-[10px] ml-1 tracking-widest">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#e9c176]/40 text-[20px] pointer-events-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>person</span>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-4 pl-12 pr-4 rounded-xl text-[#dee4de] font-sans placeholder:text-[#c1c8c2]/30 bg-black/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border-b border-[#e9c176]/20 transition-all duration-300 focus:outline-none focus:border-[#e9c176] focus:bg-black/30" 
                    placeholder="Your Full Name" 
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-sans font-bold text-[#e9c176]/70 uppercase text-[10px] ml-1 tracking-widest">Member Identity</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#e9c176]/40 text-[20px] pointer-events-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>account_circle</span>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-4 pl-12 pr-4 rounded-xl text-[#dee4de] font-sans placeholder:text-[#c1c8c2]/30 bg-black/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border-b border-[#e9c176]/20 transition-all duration-300 focus:outline-none focus:border-[#e9c176] focus:bg-black/30" 
                  placeholder="Email Address" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="font-sans font-bold text-[#e9c176]/70 uppercase text-[10px] tracking-widest">Security Key</label>
                {isLogin && <a className="font-sans text-[#c1c8c2]/40 hover:text-[#e9c176] transition-all uppercase text-[9px]" href="#">Forgotten?</a>}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#e9c176]/40 text-[18px] pointer-events-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>lock</span>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-4 pl-12 pr-4 rounded-xl text-[#dee4de] font-sans placeholder:text-[#c1c8c2]/30 bg-black/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border-b border-[#e9c176]/20 transition-all duration-300 focus:outline-none focus:border-[#e9c176] focus:bg-black/30" 
                  placeholder="••••••••" 
                />
              </div>
              {!isLogin && (
                <p className="text-[10px] text-[#c1c8c2]/60 ml-1 mt-2">
                  Use at least 4 numbers, 1 special character, and both uppercase and lowercase letters.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input 
                id="remember" 
                type="checkbox"
                className="w-4 h-4 rounded border-[#414844] bg-[#090f0c] text-[#e9c176] focus:ring-[#e9c176]/20 accent-[#e9c176]"
              />
              <label className="font-sans text-[11px] text-[#c1c8c2]/60 cursor-pointer" htmlFor="remember">
                Maintain access on this vessel
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-4 bg-gradient-to-r from-[#604403] to-[#e9c176] text-[#261900] font-sans font-bold rounded-full shadow-[0_8px_24px_rgba(96,68,3,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-3 group disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">Processing...</span>
              ) : (
                <>
                  {isLogin ? 'Enter the Atelier' : 'Forge Account'}
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Social Auth Separator */}
          <div className="mt-10 w-full flex flex-col items-center gap-6">
            <div className="flex items-center w-full gap-2">
              <div className="h-[1px] flex-1 bg-[#414844]/30"></div>
              <span className="font-sans font-bold text-[#c1c8c2]/30 uppercase text-[9px] tracking-widest">Third-Party Entrance</span>
              <div className="h-[1px] flex-1 bg-[#414844]/30"></div>
            </div>
            
            <div className="flex gap-6">
              <button type="button" className="w-14 h-14 rounded-full bg-[#062c1e]/40 backdrop-blur-[50px] saturate-150 border-t border-l border-[#e9c176]/30 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_0_1px_rgba(233,193,118,0.1)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                <img alt="Apple" className="w-5 h-5 opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8XfC2e4wk3Q9ZyAaSE1s1pMFb_7kc4t-vYrWPlW5Xw2izpSKoWKQdtigV1bX2pcGJyL_U8vQQdSKqnYnGA8RUhP4m4hhfkd_ayWRMcipmP6KJxHgc5nmq7KZCtq4GB3HwNRk7fjhKz5_rYNxL8QEYbwCa7yilti-GC2X6zFdhNqXKu0UQd5gOmy5Fm04gztED6pfh4w-IwFffkcYhpV_2SpGnPoO4cC73Z63LukCwia4gQXIG19k-JM0bEO7lUa7rkTgcRVe4CkW2"/>
              </button>
              <button type="button" className="w-14 h-14 rounded-full bg-[#062c1e]/40 backdrop-blur-[50px] saturate-150 border-t border-l border-[#e9c176]/30 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_0_1px_rgba(233,193,118,0.1)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                <img alt="Google" className="w-5 h-5 opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTHee4a8qC0uhB1TBOMQTcv1oGoTooVS5YNzkKxukC9F4DuhUSy7R79XOBG_iUfmuFOz0fJ0MVtlKkmu1Ap4T2KtYpQsN-WjMv8O252ATvHWba6lbO7wNP1pa97fZKmKofQKrsej2YxYl9Qb7VSX9JXcJAfL3wZk6Grnw8YqZgjp5o2vEDhYDRiIYEq_oYa614JGFg9YgIA83reFxhk9jnnDCnuZHIOSK97p0RilkfOCjXYeR2E2ZI8TIGwm8hlCzWUSf7KPsEZtS4"/>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-5 left-0 w-full z-10 px-4 sm:px-8 flex justify-between items-center opacity-40">
        <p className="font-sans font-bold text-[9px] text-[#dee4de] uppercase tracking-widest">© 2026 Crownwing Fine Furniture</p>
        <div className="flex gap-8">
          <a className="font-sans font-bold text-[9px] text-[#dee4de] uppercase tracking-widest hover:text-[#e9c176] transition-colors" href="#">SECURED</a>
        </div>
      </footer>
    </div>
  );
}
