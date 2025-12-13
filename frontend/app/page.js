"use client";

import React, { useState } from "react";
import Image from "next/image";
import {AvatarCreator} from "./AvatarCreator"; // default import
import TopRightControls from "../components/ui/TopRightControls";
import CarouselModal from "../components/ui/CarouselModal";

// NEW: SearchModal (the PC popup modal you added)
import SearchModal from "../components/ui/SearchModal";

export default function Page() {
  // avatar state
  const [searchOpen, setSearchOpen] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // slides for carousel fallback
  const slides = [
    { key: "search", title: "Search", desc: "Browse community designs & presets.", img: "/images/trait-1.jpg" },
    { key: "support", title: "Support", desc: "Docs, FAQs and contact options.", img: "/images/trait-2.jpg" },
    { key: "login", title: "Login", desc: "Sign in to manage your deployments.", img: "/images/trait-3.jpg" },
  ];

  // Top-right menu handler — open SearchModal for community/search
  const handleTopRightSelect = (key) => {
    if (key === "search" || key === "community") {
      setSearchOpen(true);
      return;
    }
    const idx = slides.findIndex((s) => s.key === key);
    setCarouselIndex(idx >= 0 ? idx : 0);
    setCarouselOpen(true);
  };

  // Avatar export handler - opens in new window to avatar_page
  const handleAvatarExported = (url) => {
    console.log("Avatar URL:", url);
    setShowCreator(false);
    // If we got a URL, use it directly
    if (url) {
      const avatarPageUrl = `/avatar_page?avatar=${encodeURIComponent(url)}`;
      window.open(avatarPageUrl, '_blank');
    } else {
      // If no URL, redirect to paste page
      window.open('/paste_avatar', '_blank');
    }
  };

  // Export from SearchModal to avatar_page in new window
  const handleModalExport = (url) => {
    setSearchOpen(false);
    const avatarPageUrl = `/avatar_page?avatar=${encodeURIComponent(url)}`;
    window.open(avatarPageUrl, '_blank');
  };

  // Called when user chooses a preset in the modal
  const handleUsePreset = (item) => {
    console.log("User chose preset:", item);
    setSearchOpen(false);
    // optionally open creator or prefill next
    // setShowCreator(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c0f", color: "#eee", position: "relative", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top nav */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 36px", gap: 24 }}>
        <div style={{ fontWeight: 700, letterSpacing: 1 }}>PersonaFlow</div>

        <nav style={{ display: "flex", gap: 24, alignItems: "center", color: "rgba(255,255,255,0.85)" }}>
          <a style={{ cursor: "pointer" }}>About</a>
          <a style={{ cursor: "pointer" }}>Docs</a>
          <a style={{ cursor: "pointer" }}>Roadmap</a>
        </nav>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <TopRightControls onSelect={handleTopRightSelect} />
          </div>
          <button
            onClick={() => setShowCreator(true)}
            style={{
              background: "#e23b3b",
              border: "none",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Create Avatar
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr 520px",
        gap: 40,
        alignItems: "center",
        padding: "40px 60px",
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/hero-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div>
          <h1 style={{ fontSize: 56, lineHeight: 1.02, margin: 0, fontWeight: 800, letterSpacing: "-1px" }}>
            DISCOVER RARE <br/> COLLECTIONS OF <br/> PERSONAS
          </h1>
          <p style={{ marginTop: 18, color: "rgba(255,255,255,0.8)", maxWidth: 620 }}>
            Turn Ready Player Me avatars into interactive, deployable web agents — no-code flows, multi-agent brains, and signal-based rendering.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ width: 420, height: 420, borderRadius: 12, overflow: "hidden", position: "relative", background: "#2a0b0b" }}>
            <Image src="/images/hero-avatar.png" alt="hero avatar" width={420} height={420} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

        </div>
      </section>

      {/* ABOUT + SCHEDULE */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, padding: "48px 60px", alignItems: "start" }}>
        <div>
          <div style={{ width: 340, height: 220, background: "#0a0a0a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image src="/images/trait-1.jpg" alt="preview" width={180} height={180} style={{ width: 180 }} />
          </div>
        </div>

        <div>
          <h3 style={{ margin: 0, fontSize: 22 }}>ABOUT PERSONAFLOW</h3>
          <p style={{ marginTop: 14, color: "rgba(255,255,255,0.85)" }}>
            PersonaFlow bridges Ready Player Me avatars with a multi-agent backend and signal-based rendering — enabling lightweight, expressive, and low-latency AI characters for the web.
          </p>
        </div>
      </section>

      {/* SCHEDULE BANNER */}
      <section style={{ padding: "36px 60px" }}>
        <div style={{
          backgroundImage: "url('/images/schedule-banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 12,
          padding: "28px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ margin: 0 }}>PERSONAFLOW LAUNCH EVENTS</h2>
            <p style={{ margin: "8px 0 0", opacity: 0.9 }}>Alpha / Beta / Public rollouts with live demos and workshops.</p>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>ALPHA</div>
              <div style={{ opacity: 0.9 }}>Fri • 1:00 PM</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>BETA</div>
              <div style={{ opacity: 0.9 }}>Sat • 4:00 PM</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>PUBLIC</div>
              <div style={{ opacity: 0.9 }}>Sun • 1:00 PM</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRAITS GRID */}
      <section style={{ padding: "40px 60px 80px 60px" }}>
        <h3 style={{ marginBottom: 18 }}>APPEARANCE PRESETS & ASSETS</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: "#0b0b0b", border: "1px solid #441212", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <div style={{ height: 160, borderRadius: 8, overflow: "hidden", background: "#080808", position: "relative" }}>
                <Image src={`/images/trait-${i}.jpg`} alt={`trait ${i}`} fill style={{ objectFit: "cover" }} />
              </div>
              <div style={{ marginTop: 10, fontWeight: 700 }}>{["Cyber Jacket","Blue Hair","Combat Suit","Urban Hoodie","Tactical Gear","Stealth Wear"][i-1]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "28px 60px", borderTop: "1px solid rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.7)" }}>
        <div>Powered by Ready Player Me • Signal-Based Rendering • FastAPI + LangGraph</div>
      </footer>

      {/* Avatar Creator modal */}
      {showCreator && <AvatarCreator onAvatarExported={handleAvatarExported} onCancel={() => setShowCreator(false)} />}

      {/* SearchModal (PC popup) — opened by TopRightControls "community"/"search" */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onUse={handleUsePreset}
        onExport={handleModalExport}
      />

      {/* Carousel Modal (fallback for other slides) */}
      {carouselOpen ? (
        <CarouselModal open={carouselOpen} index={carouselIndex} slides={slides} onClose={() => setCarouselOpen(false)} />
      ) : null}
    </div>
  );
}
