"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Product, collectionItems } from "@/lib/data";

const VARIANT_GROUP_PREFIXES = ["pumpkin-sofa"];

const VARIANT_SWATCH_STYLES: Record<string, string> = {
  white: "bg-[#f2efe8]",
  blue: "bg-[#9fd6ff]",
};

export default function ClientProductPage({ product }: { product: Product }) {
  const variantPrefix = VARIANT_GROUP_PREFIXES.find((prefix) =>
    product.slug.startsWith(prefix)
  );

  const colorVariants = variantPrefix
    ? collectionItems.filter((item) => item.slug.startsWith(variantPrefix))
    : [product];

  return (
    <main className="bg-[#0a0f0b] min-h-[calc(100vh-40px)] rounded-[20px] overflow-hidden text-[#dfe4dd] font-sans antialiased selection:bg-[#e9c349]/30 selection:text-[#ffe088] relative">
      
      {/* Abstract Ambiance */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-[#e9c349]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30vw] h-[30vw] bg-[#1B3022]/30 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0f0b]/80"></div>
      </div>
      
      {/* TopNavBar */}
      <nav className="absolute top-0 w-full z-50 bg-[#1B3022]/[0.23] backdrop-blur-sm flex justify-between items-center px-8 md:px-16 h-32">
        <div className="flex items-center gap-12">
          <Link className="flex items-center gap-3 font-serif text-3xl font-light tracking-widest text-[#E9C349] uppercase" href="/">
            <img 
              src="/logo-crownwing.jpg" 
              alt="CrownWing Logo" 
              className="w-12 h-12 rounded-full object-cover shadow-[0_0_15px_rgba(233,193,118,0.2)]" 
            />
            CrownWing
          </Link>
          <div className="hidden md:flex gap-10">
            <Link className="font-serif text-[15px] tracking-[0.2em] text-[#E9C349] uppercase relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[1px] after:bg-[#E9C349]/40 hover:text-[#E9C349] transition-colors duration-700 ease-out" href="/">Collection</Link>
            <a className="font-serif text-[15px] tracking-[0.2em] text-[#b4cdb8]/60 uppercase hover:text-[#E9C349] transition-colors duration-700 ease-out cursor-pointer">Bespoke</a>
            <a className="font-serif text-[15px] tracking-[0.2em] text-[#b4cdb8]/60 uppercase hover:text-[#E9C349] transition-colors duration-700 ease-out cursor-pointer">Heritage</a>
            <Link className="font-serif text-[15px] tracking-[0.2em] text-[#E9C349] uppercase hover:text-white transition-colors duration-700 ease-out cursor-pointer" href="/auth">Sign Up</Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[#E9C349] hover:text-white transition-colors duration-700 ease-out text-sm uppercase tracking-widest flex items-center gap-3 mr-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Return
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[#E9C349]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="cursor-pointer hover:opacity-80 transition-opacity">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <Link href="/cart" className="relative cursor-pointer hover:opacity-80 transition-opacity block">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="absolute -top-[6px] -right-[8px] bg-[#e9c349] text-[#0a0f0b] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </Link>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:opacity-80 transition-opacity">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </nav>

      {/* Main Content Layout - Extremely Spacious */}
      <div className="pt-48 pb-32 px-[10px] md:px-16 lg:px-24 max-w-[1600px] mx-auto relative z-10 w-full">
        
        {/* Hero Product Section */}
        <section className="flex flex-col lg:flex-row gap-20 lg:gap-32 mb-48 items-center relative">
          
          {/* Main Hero Image */}
          <motion.div 
            className="w-full lg:w-[55%] flex flex-col gap-6 relative z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative w-full aspect-square lg:aspect-[4/5] rounded-[11px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#101511]">
              <img 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out hover:scale-[1.02] opacity-95" 
                src={product.image}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0f0b]/40 to-transparent mix-blend-multiply pointer-events-none"></div>
            </div>
            
            {/* 4 Image Skeletons Row */}
            <div className="grid grid-cols-4 gap-2">
              <div className="relative w-full aspect-square bg-[#101511] overflow-hidden rounded-[11px] border border-[#e9c349]/5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <div className="w-full h-full skeleton-img" style={{ aspectRatio: '1/1' }}></div>
              </div>
              <div className="relative w-full aspect-square bg-[#101511] overflow-hidden rounded-[11px] border border-[#e9c349]/5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <div className="w-full h-full skeleton-img" style={{ aspectRatio: '1/1', animationDelay: '0.2s' }}></div>
              </div>
              <div className="relative w-full aspect-square bg-[#101511] overflow-hidden rounded-[11px] border border-[#e9c349]/5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <div className="w-full h-full skeleton-img" style={{ aspectRatio: '1/1', animationDelay: '0.4s' }}></div>
              </div>
              <div className="relative w-full aspect-square bg-[#101511] overflow-hidden rounded-[11px] border border-[#e9c349]/5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <div className="w-full h-full skeleton-img" style={{ aspectRatio: '1/1', animationDelay: '0.6s' }}></div>
              </div>
            </div>
          </motion.div>

          {/* Product Details right side */}
          <motion.div 
            className="w-full lg:w-[45%] flex flex-col justify-center relative z-20"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-12 h-[1px] bg-[#E9C349] mb-12"></div>

            <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-[#dfe4dd] mb-8 leading-[1.1]">
              {product.name}
            </h1>
            
            <div className="font-serif text-3xl text-[#E9C349] mb-12 tracking-widest">
              {product.price}
            </div>
            
            <div className="space-y-8 mb-20">
              <p className="font-sans text-xl text-[#c3c8c1] font-light leading-relaxed">
                {product.description}
              </p>
              <p className="font-sans text-lg text-[#b4cdb8]/60 font-light leading-relaxed">
                Crafted by hand in our ateliers. Each piece is unique, bearing the subtle marks of the artisan's careful hand.
              </p>
            </div>
            
            <div className="mb-20">
              <div className="flex flex-col gap-6">
                <span className="font-sans text-xs tracking-[0.2em] uppercase text-[#c3c8c1]/70">Hardware Finish</span>
                <div className="flex gap-7">
                  {colorVariants.map((variant) => {
                    const variantColor = variant.slug.split("-").pop() ?? "";
                    const swatchColorClass = VARIANT_SWATCH_STYLES[variantColor] ?? "bg-[#353a36]";
                    const isSelected = variant.slug === product.slug;

                    return (
                      <Link
                        key={variant.id}
                        href={`/product/${variant.slug}`}
                        aria-label={`View ${variant.name}`}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-transform hover:scale-110 ${swatchColorClass} ${
                          isSelected
                            ? "border-[#e9c349]/50 shadow-[0_0_15px_rgba(233,195,73,0.15)]"
                            : "border-[#434843] hover:border-[#e9c349]/50"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 my-10">
              <Link
                href="/cart"
                className="bg-[#e9c349] text-[#0a0f0b] font-sans text-sm uppercase tracking-[0.2em] py-4 px-12 rounded-sm shadow-[0_10px_30px_rgba(233,195,73,0.15)] hover:shadow-[0_15px_40px_rgba(233,195,73,0.3)] transition-all duration-500 ease-in-out flex items-center justify-center gap-4 hover:-translate-y-1"
              >
                Add to Cart
              </Link>
            </div>
            
            <div className="mt-20 pt-12 border-t border-[#e9c349]/10 grid grid-cols-2 gap-10">
              <div>
                <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#c3c8c1]/60 mb-3">Availability</h3>
                <p className="font-serif text-lg text-[#b4cdb8]">Made to Order (8-10 weeks)</p>
              </div>
              <div>
                <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#c3c8c1]/60 mb-3">Delivery</h3>
                <p className="font-serif text-lg text-[#b4cdb8]">White Glove Included</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Design Specifications - Removed the boxed border to eliminate congestion */}
        <section className="mb-48 relative py-32 border-y border-[#e9c349]/10 flex flex-col gap-24 items-start w-full">
          <div className="w-full md:w-3/4 lg:w-2/3">
            <h2 className="font-serif text-4xl lg:text-5xl text-[#dfe4dd] font-light mb-12">
              Design Specifications
            </h2>
            <p className="font-sans text-xl text-[#c3c8c1] font-light leading-relaxed">
              Meticulously engineered for absolute comfort without compromising the sharp, architectural lines of its silhouette. The frame is constructed from kiln-dried hardwood, jointed with precision and finished elegantly in hand-selected textiles.
            </p>
          </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-16 pt-4">  
          <div className="flex flex-col gap-4">
              <span className="font-sans text-xs tracking-[0.2em] uppercase text-[#e9c349]/80">Dimensions</span>
              <p className="font-serif text-2xl text-[#dfe4dd]">W 34" × D 38" × H 32"</p>
              <p className="font-sans text-md text-[#c3c8c1]/60">Seat Height: 16", Arm Height: 22"</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-sans text-xs tracking-[0.2em] uppercase text-[#e9c349]/80">Materials</span>
              <p className="font-serif text-2xl text-[#dfe4dd]">Premium Upholstery</p>
              <p className="font-sans text-md text-[#c3c8c1]/60">Solid Walnut Base, Brushed Brass Accents</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-sans text-xs tracking-[0.2em] uppercase text-[#e9c349]/80">Cushioning</span>
              <p className="font-serif text-2xl text-[#dfe4dd]">High-Resiliency Foam</p>
              <p className="font-sans text-md text-[#c3c8c1]/60">Down-blend wrap for organic softness</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-sans text-xs tracking-[0.2em] uppercase text-[#e9c349]/80">Care</span>
              <p className="font-serif text-2xl text-[#dfe4dd]">Professional Clean</p>
              <p className="font-sans text-md text-[#c3c8c1]/60">Light vacuuming recommended</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
