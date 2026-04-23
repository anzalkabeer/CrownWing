"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { collectionItems } from "@/lib/data";
import { SplashScreen } from "@/components/SplashScreen";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main>
      <SplashScreen />
      <Hero />

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
