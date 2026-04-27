"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin ? { email, password } : { name: email.split("@")[0], email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      router.push("/profile");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="velvet-bg min-h-screen flex items-center justify-center p-6 text-on-surface font-body-md antialiased relative">
      <div className="glass-card w-full max-w-[460px] rounded-xl p-stack-lg relative z-10 flex flex-col gap-stack-md">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="font-h2 text-h2 text-primary-container mb-unit">Welcome Back</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isLogin ? "Sign in to your account" : "Create your exclusive account"}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-[#121a35] p-1 rounded-lg flex items-center shadow-inner">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 font-label-sm text-label-sm py-3 rounded-DEFAULT text-center tracking-widest ${
              isLogin 
                ? "gold-gradient text-on-primary-container shadow-md" 
                : "text-on-surface-variant hover:text-on-surface transition-colors"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 font-label-sm text-label-sm py-3 rounded-DEFAULT text-center tracking-widest ${
              !isLogin 
                ? "gold-gradient text-on-primary-container shadow-md" 
                : "text-on-surface-variant hover:text-on-surface transition-colors"
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-stack-sm" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs text-center leading-relaxed">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-primary-container ml-1">EMAIL</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>mail</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121a35] border border-outline-variant rounded-DEFAULT py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all font-body-md text-body-md placeholder:text-on-surface-variant/50"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-primary-container ml-1">PASSWORD</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>lock</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121a35] border border-outline-variant rounded-DEFAULT py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all font-body-md text-body-md placeholder:text-on-surface-variant/50"
                placeholder="Enter your password"
              />
            </div>
            {isLogin && (
              <div className="text-right mt-1">
                <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-container transition-colors" href="#">Forgot Password?</a>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gold-gradient text-on-primary-container font-label-sm text-label-sm py-4 rounded-xl flex items-center justify-center gap-2 mt-4 hover:opacity-90 transition-opacity shadow-lg shadow-black/30 disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : (isLogin ? "SIGN IN" : "CREATE ACCOUNT")}
            {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-outline-variant/50"></div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">or continue with</span>
          <div className="flex-1 h-px bg-outline-variant/50"></div>
        </div>

        {/* Social Buttons */}
        <div className="flex gap-4">
          <button type="button" className="flex-1 bg-[#121a35] border border-outline-variant hover:border-primary-container/50 rounded-DEFAULT py-3 flex items-center justify-center gap-2 transition-all">
            <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS5bJm6giFQHo-Oy167BQr9q0hiiGlaOqxU60yfe9GpXrlt_LITmx4rub7f48CpsAZvLSvqr49mYnry18Ya5sd_bgNGkuc_JLecrLpOFxGcFG6chUH7UhGsjWQZhuIt_5MIHeEc1oYuOcpb6RnNPy79m-9hnyWbfGSDP4O0VNf-vCJ6nijdJ45QmCKOUkuQYylrT3dFdnWzr0JguhS8NM6P-9km08Ti39xKNgmG5CuVI9HSprMBkliYAQsp0oOY9rsIWZHzTSMICI" />
            <span className="font-label-sm text-label-sm text-on-surface">GOOGLE</span>
          </button>
          <button type="button" className="flex-1 bg-[#121a35] border border-outline-variant hover:border-primary-container/50 rounded-DEFAULT py-3 flex items-center justify-center gap-2 transition-all">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
            <span className="font-label-sm text-label-sm text-on-surface">APPLE</span>
          </button>
        </div>

      </div>
    </div>
  );
}
