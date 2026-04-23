"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import Link from "next/link";
import { collectionItems } from "@/lib/data";
import { SplashScreen } from "@/components/SplashScreen";

// Animation variants for the overlay content
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.6,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  // Motion value for the background offset (percentage-based)
  const rawOffset = useMotionValue(0);

  // Spring-smoothed offset for silky movement
  const smoothOffset = useSpring(rawOffset, {
    stiffness: 120,
    damping: 30,
    mass: 0.8,
  });

  // Map the offset to a CSS translate percentage
  // The image is scaled wider via CSS, so we shift within a constrained range
  const bgX = useTransform(smoothOffset, (v) => `${v}%`);

  // Very subtle vertical parallax on mouse Y
  const rawOffsetY = useMotionValue(0);
  const smoothOffsetY = useSpring(rawOffsetY, {
    stiffness: 100,
    damping: 40,
    mass: 1,
  });
  const bgY = useTransform(smoothOffsetY, (v) => `${v}%`);

  // --- MOUSE handlers (desktop) ---
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();

      // normalise to -1 … +1
      const normX = (e.clientX / width - 0.5) * 2;
      const normY = (e.clientY / height - 0.5) * 2;

      // Max pan range ±5 %
      rawOffset.set(normX * -5);
      rawOffsetY.set(normY * -2);
    },
    [rawOffset, rawOffsetY]
  );

  // --- TOUCH handlers (mobile) ---
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isDragging.current = true;
      lastX.current = e.touches[0].clientX;
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastX.current;
      lastX.current = touch.clientX;

      const { width } = containerRef.current.getBoundingClientRect();
      // Convert pixel delta to percentage movement
      const percentDelta = (deltaX / width) * 15;

      // Clamp the offset
      const current = rawOffset.get();
      const next = Math.max(-8, Math.min(8, current + percentDelta));
      rawOffset.set(next);
    },
    [rawOffset]
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Subtle floating animation for the vignette
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    // Preload the hero image
    const img = new Image();
    img.src = "/hero-background.png";
    img.onload = () => setIsLoaded(true);
  }, []);

  return (
    <main>
      <SplashScreen />
    <div
      ref={containerRef}
      className="hero-landing"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Interactive Background Image */}
      <motion.div
        className="hero-bg-wrapper"
        style={{ x: bgX, y: bgY }}
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: isLoaded ? 1 : 0,
        }}
        transition={{
          scale: { duration: 2, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 1.5, ease: "easeOut" },
        }}
      >
        <img
          src="/hero-background.png"
          alt="CrownWing luxury furniture showcase"
          className="hero-bg-image"
          draggable={false}
        />
      </motion.div>

      {/* Dark vignette overlay for text readability */}
      <div className="hero-vignette" />

      {/* Ambient warm glow */}
      <div className="hero-glow" />

      {/* Content Overlay */}
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Navbar */}
        <motion.nav className="hero-nav" variants={itemVariants}>
          <div className="hero-nav-brand flex items-center gap-3">
            <img 
              src="/logo-crownwing.jpg" 
              alt="CrownWing Logo" 
              className="w-10 h-10 rounded-full object-cover shadow-[0_0_15px_rgba(233,193,118,0.2)]" 
            />
            <span className="hero-nav-name tracking-widest text-[#e9c349]">CrownWing</span>
          </div>
          <div className="hero-nav-links desktop-menu">
            <a href="#collection" className="hero-nav-link">Shop</a>
            <a href="#about" className="hero-nav-link">About</a>
            <Link href="/contact" className="hero-nav-link">Contact</Link>
            <Link href="/auth" className="hero-nav-link" style={{color: '#e9c349'}}>Sign Up</Link>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[#E9C349]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" className="cursor-pointer hover:opacity-80 transition-opacity">
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
          <button className="mobile-menu-btn" aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </motion.nav>

        {/* Hero Text */}
        <div className="hero-text-block">
          <motion.div className="hero-tag" variants={itemVariants}>
            <div className="hero-tag-line" />
            <span>Premium Collection 2026</span>
          </motion.div>

          <motion.h1 className="hero-heading" variants={itemVariants}>
            Crafted for Comfort.
            <br />
            <span className="hero-heading-accent">Designed for Elegance.</span>
          </motion.h1>

          <motion.p className="hero-description" variants={itemVariants}>
            Discover luxury furniture that transforms your home.
            Every curve, every texture — meticulously designed.
          </motion.p>

          <motion.div className="hero-cta-group" variants={itemVariants}>
            <motion.button
              className="cta-button"
              id="explore-collection-cta"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Collection
              <span className="cta-button-arrow">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </motion.button>

            <motion.button
              className="cta-button-secondary"
              id="learn-more-cta"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div className="hero-stats" variants={itemVariants}>
            <div className="hero-stat">
              <span className="hero-stat-value">250+</span>
              <span className="hero-stat-label">Designs</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">15k+</span>
              <span className="hero-stat-label">Happy Homes</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">4.9★</span>
              <span className="hero-stat-label">Rating</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="scroll-hint"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <div className="scroll-hint-mouse">
          <div className="scroll-hint-dot" />
        </div>
        <span>Drag or move to explore</span>
      </motion.div>
    </div>

      {/* Collection Section */}
      <section id="collection" className="collection-section">
        <div className="collection-header">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="collection-title"
          >
            Curated Elegance
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="collection-subtitle"
          >
            Explore our latest arrivals designed to bring sophistication and comfort to your everyday living.
          </motion.p>
        </div>

        <div className="collection-grid">
          {collectionItems.map((item, i) => (
            <CollectionCardItem item={item} i={i} key={item.id} />
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div className="about-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="about-icon"
            >
              <path
                d="M20 4C17 10 10 14 4 14C6 20 10 26 20 36C30 26 34 20 36 14C30 14 23 10 20 4Z"
                fill="currentColor"
                opacity="0.9"
              />
            </svg>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="about-title"
          >
            Our Commitment to You
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="about-text"
          >
            At <span className="about-text-highlight">CrownWing</span>, we believe that furniture is far more than mere decoration—it is the very foundation of your daily life. We value your <span className="about-text-highlight">comfort and peace of mind</span> above all else. By pouring uncompromising craftsmanship, sustainable materials, and elegant design into every piece, our sole mission is to ensure that your home remains a timeless sanctuary of modern luxury and serene relaxation.
          </motion.p>
        </div>
      </section>
    </main>
  );
}

function CollectionCardItem({ item, i }: { item: any; i: number }) {
  const boundingRef = useRef<DOMRect | null>(null);

  return (
    <Link href={`/product/${item.slug}`} style={{ textDecoration: 'none', perspective: '1200px', display: 'block' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ 
          opacity: { duration: 0.6, delay: i * 0.1 },
          y: { duration: 0.6, delay: i * 0.1 }
        }}
        onMouseLeave={(ev) => {
          boundingRef.current = null;
          ev.currentTarget.style.transform = `rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)`;
          ev.currentTarget.style.boxShadow = "none";
          ev.currentTarget.style.borderColor = "rgba(201, 164, 92, 0.1)";
        }}
        onMouseEnter={(ev) => {
          boundingRef.current = ev.currentTarget.getBoundingClientRect();
        }}
        onMouseMove={(ev) => {
          if (!boundingRef.current) return;
          const x = ev.clientX - boundingRef.current.left;
          const y = ev.clientY - boundingRef.current.top;
          const xPercentage = x / boundingRef.current.width;
          const yPercentage = y / boundingRef.current.height;
          const xRotation = (xPercentage - 0.5) * 21;
          const yRotation = (0.5 - yPercentage) * 21;

          ev.currentTarget.style.transform = `rotateX(${yRotation}deg) rotateY(${xRotation}deg) scale(1.02) translateZ(20px)`;
          ev.currentTarget.style.boxShadow = "0 30px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(201, 164, 92, 0.15)";
          ev.currentTarget.style.borderColor = "rgba(201, 164, 92, 0.5)";
        }}
        className="collection-card relative group"
        style={{
          cursor: "pointer",
          background: "rgba(201, 164, 92, 0.02)",
          border: "1px solid rgba(201, 164, 92, 0.1)",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out",
        }}
      >
        {/* Image Container */}
        <div style={{ height: '300px', width: '100%', overflow: 'hidden' }}>
          <img 
            src={item.image} 
            alt={item.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Text Container */}
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-cream)', margin: 0, fontFamily: 'var(--font-display), serif', lineHeight: 1.2 }}>{item.name}</h3>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '1.1rem' }}>{item.price}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
            {item.description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
