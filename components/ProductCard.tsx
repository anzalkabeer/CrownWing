import Link from "next/link";
import { Product } from "@/lib/data";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group h-full relative flex flex-col p-6 rounded-2xl bg-[#0c1022] border border-[#1a2240] shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Product Image Box matching the mockup's inner feature box */}
      <div className="w-full aspect-square rounded-lg bg-surface-container-highest flex items-center justify-center mb-6 border border-outline-variant/20 shadow-inner overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      
      <h3 className="font-h3 text-h3 text-on-surface mb-2 line-clamp-2">{product.name}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">{product.description}</p>
      
      <div className="flex justify-between items-center mt-auto font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-[0.15em] group-hover:text-primary transition-colors">
        <span className="font-body-md text-body-md font-medium text-primary normal-case tracking-normal">{product.price}</span>
        <div className="flex items-center gap-1">
          <span>VIEW</span>
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>chevron_right</span>
        </div>
      </div>
    </Link>
  );
}
