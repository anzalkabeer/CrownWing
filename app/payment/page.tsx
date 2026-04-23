import Link from "next/link";

export default function PaymentPage() {
  return (
    <main className="min-h-[calc(100vh-40px)] rounded-[20px] overflow-hidden bg-[#0a0f0b] text-[#dfe4dd] px-6 md:px-12 py-16 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[8%] left-[8%] w-[36vw] h-[36vw] rounded-full bg-[#1b3022]/30 blur-[120px]" />
        <div className="absolute bottom-[-12%] right-[8%] w-[35vw] h-[35vw] rounded-full bg-[#e9c349]/12 blur-[120px]" />
      </div>
      <section className="relative z-10 max-w-3xl mx-auto border border-[#e9c349]/20 rounded-[22px] p-8 md:p-12 bg-[linear-gradient(145deg,rgba(6,44,30,0.72),rgba(10,15,11,0.55))] backdrop-blur-[28px] shadow-[0_30px_60px_rgba(0,0,0,0.55)] text-center">
        <p className="uppercase tracking-[0.25em] text-xs text-[#e9c349]/90 mb-4">Payment</p>
        <h1 className="font-serif text-4xl md:text-5xl text-[#e9c349] mb-5">Secure Checkout</h1>
        <p className="text-[#c3c8c1] leading-relaxed mb-10">
          Your cart transition is complete. Connect your payment form here to finalize orders.
        </p>
        <Link
          href="/cart"
          className="inline-block rounded-full border border-[#e9c349]/30 px-7 py-3 text-sm uppercase tracking-[0.2em] text-[#e9c349] hover:bg-[#e9c349]/10 transition-colors"
        >
          Back to Cart
        </Link>
      </section>
    </main>
  );
}
