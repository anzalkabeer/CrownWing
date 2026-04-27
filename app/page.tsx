"use client";

import { collectionItems } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="velvet-bg min-h-screen text-on-background font-body-md relative overflow-x-hidden flex flex-col">


      <main className="flex-grow relative z-10 w-full flex flex-col">
        {/* Hero scrolling video component */}
        <Hero />

        {/* Collection Grid */}
        <section id="collection" className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-24 flex flex-col gap-12">
          <header className="flex flex-col items-center text-center">
            <h2 className="font-h2 text-h2 text-primary-container mb-4">The Collection</h2>
            <div className="w-12 h-px bg-primary/50 mb-4"></div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em]">Curated Masterpieces</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr">
            {collectionItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
