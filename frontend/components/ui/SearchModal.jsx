"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

export default function SearchModal({
  open,
  onClose = () => {},
  onUse = () => {},
  onExport = () => {},
  exportImage = "/images/hero-avatar.png",
}) {
  const containerRef = useRef(null);

  // IMAGE LISTS
  const traitImages = [
    "/images/trait-1.jpg",
    "/images/trait-2.jpg",
    "/images/trait-3.jpg",
    "/images/trait-4.jpg",
    "/images/trait-5.jpg",
    "/images/trait-6.jpg",
  ];

  const featuredImage = "/images/hero-bg.jpg"; // you can change to schedule-banner.jpg
  const thumbnailImages = [
    "/images/akka.jpg",
    "/images/about-hero.jpg",
    "/images/hero-avatar.png",
    "/images/placeholder-avatar-thumb.jpg",
    "/images/schedule-banner.jpg",
    "/images/hero-bg.jpg",
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* backdrop blur */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(3,3,3,0.65)",
          backdropFilter: "blur(6px)",
        }}
      />

      <style>{`
        @keyframes modal-in {
          0% { opacity: 0; transform: translateY(12px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pf-glow {
          box-shadow: 0 10px 40px rgba(255,20,20,0.06),
                      0 2px 12px rgba(0,0,0,0.6),
                      inset 0 0 28px rgba(255,20,20,0.01);
          border-image: linear-gradient(90deg, rgba(255,60,60,0.9), rgba(255,90,90,0.85)) 1;
        }
      `}</style>

      {/* modal card */}
      <div
        ref={containerRef}
        onClick={stop}
        className="pf-glow"
        style={{
          width: 1160,
          height: 820,
          borderRadius: 16,
          padding: 20,
          boxSizing: "border-box",
          background: "linear-gradient(180deg,#070707,#0b0b0b)",
          border: "1px solid rgba(255,0,0,0.08)",
          position: "relative",
          animation: "modal-in 260ms cubic-bezier(.2,.9,.2,1)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          overflow: "hidden",
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.03)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >✕</button>

        {/* HEADER ROW */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: "linear-gradient(180deg,#ff6b6b,#ff2b2b)" }} />
            <div style={{ fontFamily: "monospace", fontSize: 20, letterSpacing: 1.6, fontWeight: 800 }}>SEARCH DESIGNS</div>
          </div>
          <button
            style={exportBtn}
            onClick={() => onExport(exportImage)}
          >
            Export Avatar
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ display: "flex", gap: 18, flex: 1, overflow: "hidden" }}>

          {/* LEFT SIDE — GRID */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            
            <div style={{ flex: 1, overflow: "auto" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
              }}>
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div key={idx} style={{
                    background: "#0b0b0b",
                    borderRadius: 12,
                    padding: 12,
                    border: "1px solid rgba(255,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}>
                    <div style={{ position: "relative", width: "100%", height: 110, borderRadius: 10, overflow: "hidden" }}>
                      <Image
                        src={traitImages[idx % traitImages.length]}
                        alt={`Preset ${idx + 1} design`}
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Preset {idx + 1}</div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                      Auto-generated style preset from PersonaFlow traits.
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={ghostBtn}>Open</button>
                      <button style={useBtn} onClick={() => onUse({ id: idx + 1 })}>Use</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — FEATURED ARTWORK */}
          <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 12 }}>
            
            <div style={{
              height: 420,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(255,0,0,0.05)",
            }}>
              <Image
                src={featuredImage}
                alt="Featured artwork design"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* small thumbnails */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {thumbnailImages.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt={`Thumbnail preview ${i + 1}`}
                  width={64}
                  height={52}
                  style={{
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid rgba(255,0,0,0.04)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const ghostBtn = {
  padding: "8px 12px",
  borderRadius: 10,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.04)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const useBtn = {
  padding: "8px 12px",
  borderRadius: 10,
  background: "linear-gradient(90deg,#ff4b4b,#ff6b6b)",
  border: "none",
  color: "#111",
  cursor: "pointer",
  fontWeight: 800,
};

const exportBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "linear-gradient(90deg,#3b82f6,#22d3ee)",
  border: "none",
  color: "#0b0b0b",
  cursor: "pointer",
  fontWeight: 800,
  boxShadow: "0 8px 20px rgba(34,211,238,0.18)",
};
