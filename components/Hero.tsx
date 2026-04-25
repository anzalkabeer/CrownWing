"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Configuration ──────────────────────────────────────────────
const HERO_HEIGHT_VH = 350;  // Tall runway section that drives the scroll
const LERP_FACTOR = 0.08;    // How quickly currentTime catches up (lower = smoother)
const LERP_THRESHOLD = 0.005; // Minimum delta before stopping the lerp loop

// ─── Helpers ────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

// ─── Component ──────────────────────────────────────────────────
export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Lerp state (refs to avoid re-renders in the animation loop)
  const currentTimeRef = useRef<number>(0);
  const targetTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const durationRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [isInView, setIsInView] = useState(true);

  // ── Scroll → Video time mapping + lerp render loop ────────────
  // Defined as a ref-stable callback so we can call it from both
  // the event listener and the initial setup.
  const updateTargetTime = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Visibility check for the fade effect
    const sectionInView = rect.bottom > 0 && rect.top < windowH;
    setIsInView(sectionInView);

    // Calculate scroll progress through the runway section (0 → 1)
    const scrolled = windowH - rect.top;
    const total = windowH + rect.height;
    const progress = clamp(scrolled / total, 0, 1);

    targetTimeRef.current = progress * durationRef.current;

    if (!isAnimatingRef.current && durationRef.current > 0) {
      isAnimatingRef.current = true;
      renderLoop();
    }
  }, []);

  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      isAnimatingRef.current = false;
      return;
    }

    const target = targetTimeRef.current;
    const current = currentTimeRef.current;
    const delta = target - current;

    if (Math.abs(delta) < LERP_THRESHOLD) {
      // Close enough — snap and stop
      currentTimeRef.current = target;
      try { video.currentTime = target; } catch (_) { /* ignore */ }
      isAnimatingRef.current = false;
      return;
    }

    // Smoothly interpolate
    currentTimeRef.current += delta * LERP_FACTOR;

    try { video.currentTime = currentTimeRef.current; } catch (_) { /* ignore */ }

    rafRef.current = requestAnimationFrame(renderLoop);
  }, []);

  // ── Wait for the video metadata so we know the duration ───────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onMetadataLoaded = () => {
      if (!video.duration || isNaN(video.duration)) return;
      durationRef.current = video.duration;
      video.currentTime = 0;
      setIsReady(true);
    };

    // `loadedmetadata` fires as soon as duration/dimensions are known
    video.addEventListener("loadedmetadata", onMetadataLoaded);

    // In case it already fired (bfcache, fast cache hit)
    if (video.readyState >= 1 && video.duration && !isNaN(video.duration)) {
      onMetadataLoaded();
    }

    return () => {
      video.removeEventListener("loadedmetadata", onMetadataLoaded);
    };
  }, []);

  // ── Attach scroll handler once video is ready ─────────────────
  useEffect(() => {
    if (!isReady) return;

    window.addEventListener("scroll", updateTargetTime, { passive: true });
    updateTargetTime(); // Set initial position

    return () => {
      window.removeEventListener("scroll", updateTargetTime);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      isAnimatingRef.current = false;
    };
  }, [isReady, updateTargetTime]);

  return (
    <>
      {/* Fixed video layer — pinned to viewport */}
      <div
        className="hero-canvas-fixed"
        style={{
          opacity: isInView ? 1 : 0,
          pointerEvents: isInView ? "auto" : "none",
        }}
      >
        <video
          ref={videoRef}
          className="hero-video"
          src="/hero-video.mp4"
          muted
          playsInline
          preload="auto"
          controls={false}
          autoPlay={false}
        />

        <div className="hero-canvas-vignette" />

        {/* Loading state — shown until video metadata is available */}
        {!isReady && (
          <div className="hero-canvas-loader">
            <div className="hero-canvas-loader-bar">
              <div className="hero-canvas-loader-fill hero-canvas-loader-fill--indeterminate" />
            </div>
            <span className="hero-canvas-loader-text">Loading</span>
          </div>
        )}

        {/* Overlay text */}
        <div
          className="hero-canvas-overlay"
          style={{ opacity: isReady ? 1 : 0 }}
        >
          <h1 className="hero-canvas-heading">Crafted for Comfort</h1>
          <p className="hero-canvas-sub">Scroll to explore the experience</p>
        </div>
      </div>

      {/* Scroll runway — tall invisible section that drives the animation */}
      <section
        ref={sectionRef}
        className="hero-canvas-container"
        style={{ height: `${HERO_HEIGHT_VH}vh` }}
      />
    </>
  );
}
