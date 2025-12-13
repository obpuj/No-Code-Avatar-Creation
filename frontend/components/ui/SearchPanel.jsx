"use client";

import React, { useEffect, useRef } from "react";

/**
 * components/ui/SearchModal.jsx
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onUse(item) optional callback
 *
 * Renders a large centered modal (desktop popup dimensions) with:
 *  - backdrop blur + dark overlay
 *  - neon red border + soft glow
 *  - scale + fade-in animation
 *  - ESC key support and click-outside to close
 *  - interior layout (hero, icons, thumbnails) matching the reference feel
 *
 * No external images required (placeholders / gradients).
 */

export default function SearchModal({ open, onClose = () => {}, onUse = () => {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      // arrow navigation or other keys could be handled here
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent scroll behind the modal
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  // small helper to stop clicks from closing modal
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
      {/* backdrop: dark + blur */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(3,3,3,0.65)",
          backdropFilter: "blur(6px) saturate(120%)",
        }}
      />

      {/* style tag for keyframes & small helpers */}
      <style>{`
        @keyframes modal-in {
          0% { opacity: 0; transform: translateY(12px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pf-glow {
          box-shadow: 0 10px 40px rgba(255,20,20,0.06), 0 2px 12px rgba(0,0,0,0.6), inset 0 0 28px rgba(255,20,20,0.01);
          border-image: linear-gradient(90deg, rgba(255,60,60,0.9), rgba(255,90,90,0.85)) 1;
        }
      `}</style>

      {/* modal card */}
      <div
        ref={containerRef}
        onClick={stop}
        className="pf-glow"
        style={{
          width: 1160,                // desktop popup width
          maxWidth: "96vw",
          height: 820,                // desktop popup height
          maxHeight: "92vh",
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
        {/* close button (top-right) */}
        <button
          onClick={onClose}
          aria-label="Close modal"
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
            backdropFilter: "blur(4px)",
          }}
        >
          ✕
        </button>

        {/* Header row: title + small actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: "linear-gradient(180deg,#ff6b6b,#ff2b2b)" }} />
            <div style={{ fontFamily: "monospace", fontSize: 20, letterSpacing: 1.6, fontWeight: 800 }}>SEARCH DESIGNS</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Browse presets & community art</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => { /* future sort */ }} style={pillStyle}>Sort</button>
            <button onClick={() => { /* future filters */ }} style={pillStyle}>Filters</button>
          </div>
        </div>

        {/* main content area */}
        <div style={{ display: "flex", gap: 18, flex: 1, overflow: "hidden" }}>
          {/* LEFT: results + search */}
          <div style={{ flex: "1 1 640px", display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
            {/* Search input */}
            <div style={{ display: "flex", gap: 10 }}>
              <input
                placeholder="Search presets, tags, or descriptions..."
                aria-label="Search"
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "#0b0b0b",
                  border: "1px solid rgba(255,0,0,0.06)",
                  color: "#fff",
                  outline: "none",
                }}
              />
              <button style={{ ...pillStyle, padding: "10px 14px" }}>Search</button>
            </div>

            {/* tag chips row */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["all","cyberpunk","casual","tactical","stealth","fun"].map((t, i) => (
                <button key={t} style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: i === 0 ? "linear-gradient(90deg,#3b0f0f,#7a0f0f)" : "#0b0b0b",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.03)",
                  cursor: "pointer",
                }}>{t}</button>
              ))}
            </div>

            {/* results: scrollable grid */}
            <div style={{ overflowY: "auto", paddingRight: 8, flex: 1 }}>
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
                    <div style={{ height: 110, borderRadius: 10, background: "linear-gradient(135deg, rgba(255,0,0,0.04), rgba(0,0,0,0.04))" }} />
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Preset {idx + 1}</div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, flex: 1 }}>Short description of the preset, what it&apos;s good for and a one-line pitch.</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { /* open detail */ }} style={ghostBtn}>Open</button>
                      <button onClick={() => onUse({ id: idx + 1 })} style={useBtn}>Use</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: feature carousel / large artwork preview */}
          <div style={{ width: 420, minWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              height: 420,
              borderRadius: 12,
              overflow: "hidden",
              background: "linear-gradient(180deg,#0b0b0b,#050505)",
              border: "1px solid rgba(255,0,0,0.05)",
              display: "flex",
              flexDirection: "column"
            }}>
              {/* big artwork placeholder */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "repeating-linear-gradient( -45deg, rgba(255,0,0,0.02) 0 6px, rgba(0,0,0,0.02) 6px 12px )" }}>
                <div style={{ color: "rgba(255,255,255,0.7)" }}>Featured artwork (placeholder)</div>
              </div>

              {/* small caption + controls */}
              <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, background: "#120202", border: "1px solid rgba(255,0,0,0.06)" }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>Cyber Jacket</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Neon-trimmed jacket — confident & bold.</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...ghostBtn, padding: "8px 12px" }}>Fav</button>
                  <button style={{ ...useBtn, padding: "8px 12px" }} onClick={() => onUse({ id: "featured" })}>Use</button>
                </div>
              </div>
            </div>

            {/* small artwork strip / thumbnails */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  width: 64,
                  height: 52,
                  borderRadius: 8,
                  background: "linear-gradient(180deg, rgba(255,0,0,0.03), rgba(0,0,0,0.03))",
                  border: "1px solid rgba(255,0,0,0.04)",
                  cursor: "pointer"
                }} />
              ))}
            </div>

            {/* footer small */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              <div>PersonaFlow • Signal-Based Rendering</div>
              <div>© {new Date().getFullYear()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* small reused inline styles to keep file tidy */
const pillStyle = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.04)",
  background: "rgba(255,255,255,0.02)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

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
