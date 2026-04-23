"use client";

import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [heroHeight, setHeroHeight] = useState(300);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    video.pause();

    const updateProgress = () => {
      if (!video.duration) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.min(
        Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0),
        1
      );

      if (video.readyState >= 2) {
        video.currentTime = video.duration * progress;
      }
    };

    const scheduleUpdate = () => {
      if (!video.duration || rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        updateProgress();
        rafRef.current = null;
      });
    };

    const handleMetadata = () => {
      if (!video.duration) return;

      video.currentTime = 0.01;
      setHeroHeight(video.duration * 100);
      scheduleUpdate();
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", handleMetadata);
    video.addEventListener("loadedmetadata", handleMetadata);

    if (video.readyState >= 1) {
      handleMetadata();
    }

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", handleMetadata);
      video.removeEventListener("loadedmetadata", handleMetadata);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-container"
      style={{ height: `${heroHeight}vh` }}
    >
      <div className="sticky-wrapper">
        <video
          ref={videoRef}
          src="/hero-video.mp4"
          muted
          playsInline
          preload="auto"
          poster="/hero-image.png"
          className="video"
        />
        <div
          className="video-fallback"
          style={{ backgroundImage: "url('/hero-image.png')" }}
        />
        <div className="video-hero-overlay">
          <h1>Crafted for Comfort</h1>
        </div>
      </div>
    </section>
  );
}
