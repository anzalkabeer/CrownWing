"use client";

import { useState } from "react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="velvet-bg min-h-screen text-on-background font-body-md antialiased relative flex flex-col">
      {/* Texture Overlay */}
      <div className="fixed inset-0 velvet-grain opacity-10 mix-blend-overlay pointer-events-none z-0" data-alt="subtle dark velvet fabric texture overlay with soft natural light diffusion"></div>
      <div className="fixed inset-0 bg-secondary-container/5 mix-blend-soft-light pointer-events-none z-0"></div>

      <main className="flex-grow relative z-10 pt-32 pb-section-padding px-8 w-full">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            
            {/* Left Column: Information */}
            <div className="lg:col-span-5 flex flex-col pt-12">
              <h1 className="font-h2 text-h2 text-on-surface mb-stack-md font-light">Get In Touch</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 leading-relaxed">
                We invite you to experience the unparalleled craftsmanship of CrownWing. Connect with our dedicated concierge for bespoke inquiries, private viewings, or detailed provenance of our collections.
              </p>
              
              <div className="flex flex-col gap-10">
                {/* Contact Block 1 */}
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/30 shadow-inner">
                    <span className="material-symbols-outlined text-primary/70" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant tracking-[0.15em] uppercase">Email</span>
                    <a className="font-body-md text-body-md text-on-surface hover:text-primary transition-colors" href="mailto:concierge@crownwing.com">concierge@crownwing.com</a>
                  </div>
                </div>
                
                {/* Contact Block 2 */}
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/30 shadow-inner">
                    <span className="material-symbols-outlined text-primary/70" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant tracking-[0.15em] uppercase">Phone</span>
                    <a className="font-body-md text-body-md text-on-surface hover:text-primary transition-colors" href="tel:+18005550199">+1 (800) 555-0199</a>
                  </div>
                </div>
                
                {/* Contact Block 3 */}
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/30 shadow-inner">
                    <span className="material-symbols-outlined text-primary/70" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant tracking-[0.15em] uppercase">Location</span>
                    <span className="font-body-md text-body-md text-on-surface leading-snug">The CrownWing Atelier<br/>450 Platinum Avenue<br/>London, W1K 3QH</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form Card */}
            <div className="lg:col-span-7">
              <div className="bg-secondary-container/10 backdrop-blur-2xl border border-outline-variant/40 rounded-xl p-10 lg:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
                {/* Subtle inner glow for depth */}
                <div className="absolute inset-0 border border-primary/10 rounded-xl pointer-events-none"></div>
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                
                <form className="flex flex-col gap-8 relative z-10" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3">
                      <label className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase" htmlFor="name">Full Name</label>
                      <input required className="bg-surface-container-highest/50 border-b border-outline-variant text-on-surface font-body-md text-body-md px-4 py-3 rounded-t-lg focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-0 transition-all placeholder:text-on-surface-variant/30" id="name" placeholder="Jane Doe" type="text" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase" htmlFor="email">Email Address</label>
                      <input required className="bg-surface-container-highest/50 border-b border-outline-variant text-on-surface font-body-md text-body-md px-4 py-3 rounded-t-lg focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-0 transition-all placeholder:text-on-surface-variant/30" id="email" placeholder="jane@example.com" type="email" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase" htmlFor="subject">Subject</label>
                    <input required className="bg-surface-container-highest/50 border-b border-outline-variant text-on-surface font-body-md text-body-md px-4 py-3 rounded-t-lg focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-0 transition-all placeholder:text-on-surface-variant/30" id="subject" placeholder="Inquiry Type" type="text" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase" htmlFor="message">Message</label>
                    <textarea required className="bg-surface-container-highest/50 border-b border-outline-variant text-on-surface font-body-md text-body-md px-4 py-3 rounded-t-lg focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-0 transition-all resize-none placeholder:text-on-surface-variant/30" id="message" placeholder="How may we assist you today?" rows={5}></textarea>
                  </div>
                  
                  <button disabled={isSubmitting || isSubmitted} className="w-full mt-4 bg-gradient-to-r from-inverse-primary to-primary text-on-primary-fixed uppercase tracking-[0.2em] font-label-sm text-label-sm py-5 rounded-xl shadow-[0_10px_30px_rgba(201,164,92,0.15)] hover:shadow-[0_10px_40px_rgba(201,164,92,0.3)] border border-primary/20 transition-all duration-300 relative overflow-hidden group" type="submit">
                    <span className="relative z-10 font-semibold">{isSubmitting ? "SENDING..." : isSubmitted ? "SENT" : "SEND MESSAGE"}</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-white/40"></div>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
