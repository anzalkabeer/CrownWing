"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Configuration ──────────────────────────────────────────────
const TOTAL_FRAMES = 300;
const FRAME_PATH = "/frames/ezgif-frame-";
const FRAME_EXT = ".jpg";
const HERO_HEIGHT_VH = 350;
const LERP_FACTOR = 0.12;
const LERP_THRESHOLD = 0.01;

// ─── Helpers ────────────────────────────────────────────────────
function padIndex(i: number): string {
  return String(i).padStart(3, "0");
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function getFrameSrc(index: number): string {
  return `${FRAME_PATH}${padIndex(index)}${FRAME_EXT}`;
}

// ─── Component ──────────────────────────────────────────────────
export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastDrawnFrameRef = useRef<number>(-1);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(true);

  // ── Draw a single frame to canvas (cover-fit) ─────────────────
  const drawFrame = useCallback((frameIndex: number) => {
    if (frameIndex === lastDrawnFrameRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || !img.naturalWidth) return;

    lastDrawnFrameRef.current = frameIndex;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const drawW = iw * scale;
    const drawH = ih * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, []);

  // ── Resize canvas buffer to match viewport ────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const newW = Math.round(w * dpr);
    const newH = Math.round(h * dpr);
    if (canvas.width !== newW || canvas.height !== newH) {
      canvas.width = newW;
      canvas.height = newH;
    }

    lastDrawnFrameRef.current = -1;
    drawFrame(Math.round(currentFrameRef.current));
  }, [drawFrame]);

  // ── Preload all frame images ──────────────────────────────────
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i + 1);

      img.onload = () => {
        loadedCount++;
        const pct = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
        setLoadProgress(pct);

        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        loadedCount++;
      };

      images[i] = img;
    }
  }, []);

  // ── Canvas sizing ─────────────────────────────────────────────
  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // ── Draw first frame once loaded ──────────────────────────────
  useEffect(() => {
    if (isLoaded) {
      resizeCanvas();
      drawFrame(0);
    }
  }, [isLoaded, resizeCanvas, drawFrame]);

  // ── Scroll → Frame mapping + lerp render loop ─────────────────
  useEffect(() => {
    if (!isLoaded) return;

    const section = sectionRef.current;
    if (!section) return;

    let isAnimating = false;

    const updateTargetFrame = () => {
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Check if the section is in the viewport
      const sectionInView = rect.bottom > 0 && rect.top < windowH;
      setIsInView(sectionInView);

      const scrolled = windowH - rect.top;
      const total = windowH + rect.height;
      const progress = clamp(scrolled / total, 0, 1);

      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);

      if (!isAnimating) {
        isAnimating = true;
        renderLoop();
      }
    };

    const renderLoop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const delta = target - current;

      if (Math.abs(delta) < LERP_THRESHOLD) {
        currentFrameRef.current = target;
        const frameIdx = clamp(Math.round(target), 0, TOTAL_FRAMES - 1);
        drawFrame(frameIdx);
        isAnimating = false;
        return;
      }

      currentFrameRef.current += delta * LERP_FACTOR;

      const frameIdx = clamp(
        Math.round(currentFrameRef.current),
        0,
        TOTAL_FRAMES - 1
      );
      drawFrame(frameIdx);

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("scroll", updateTargetFrame, { passive: true });
    updateTargetFrame();

    return () => {
      window.removeEventListener("scroll", updateTargetFrame);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isLoaded, drawFrame]);

  return (
    <>
      {/* Fixed canvas layer — immune to parent overflow/sticky issues */}
      <div
        className="hero-canvas-fixed"
        style={{
          opacity: isInView ? 1 : 0,
          pointerEvents: isInView ? "auto" : "none",
        }}
      >
        <canvas ref={canvasRef} className="hero-canvas" />
        <div className="hero-canvas-vignette" />

        {!isLoaded && (
          <div className="hero-canvas-loader">
            <div className="hero-canvas-loader-bar">
              <div
                className="hero-canvas-loader-fill"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="hero-canvas-loader-text">
              {loadProgress}%
            </span>
          </div>
        )}

        <div
          className="hero-canvas-overlay"
          style={{ opacity: isLoaded ? 1 : 0 }}
        >
          <h1 className="hero-canvas-heading">
            Crafted for Comfort
          </h1>
          <p className="hero-canvas-sub">
            Scroll to explore the experience
          </p>
        </div>
      </div>

      {/* Scroll runway — this is the tall section that drives the animation */}
      <section
        ref={sectionRef}
        className="hero-canvas-container"
        style={{ height: `${HERO_HEIGHT_VH}vh` }}
      />
    </>
  );
}
