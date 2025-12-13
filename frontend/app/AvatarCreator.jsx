"use client";
import React, { useEffect, useRef } from "react";

export function AvatarCreator({ onAvatarExported, onCancel }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const receiveMessage = (event) => {
      let data = event.data;
      try {
        if (typeof data === "string") data = JSON.parse(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) { return; }

      if (!data?.source || data.source !== "readyplayerme") return;

      if (data.eventName === "v1.frame.ready") {
        iframeRef.current?.contentWindow?.postMessage(
          {
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.avatar.exported",
          },
          "*"
        );
      }

      if (data.eventName === "v1.avatar.exported") {
        const url = data.data.url;
        console.log("✅ Avatar Exported:", url);
        if (onAvatarExported) {
            onAvatarExported(url);
        }
      }
    };

    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, [onAvatarExported]);

  const handleManualExport = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        {
          target: "readyplayerme",
          type: "requestAvatarExport",
        },
        "*"
      );
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", flexDirection: "column"
    }}>
      
      {/* 1. EXPORT BUTTON (Moved Down to clear RPM header) */}
      <button
        onClick={handleManualExport}
        style={{
          position: "absolute", 
          top: 80,        // <--- Moved down so it doesn't cover "Next"
          right: 30, 
          padding: "12px 24px",
          background: "#0070f3", 
          color: "white", 
          borderRadius: "8px", 
          border: "none",
          fontWeight: "bold", 
          cursor: "pointer", 
          zIndex: 10000
        }}
      >
        📥 Export Avatar
      </button>

      {/* 2. CLOSE BUTTON (Moved Below Export) */}
      <button
        onClick={onCancel}
        style={{
          position: "absolute", 
          top: 140,       // <--- Moved further down
          right: 30, 
          padding: "12px 24px",
          background: "white", 
          color: "black",
          borderRadius: "8px", 
          border: "none",
          fontWeight: "bold", 
          cursor: "pointer", 
          zIndex: 10000
        }}
      >
        ❌ Close
      </button>

      {/* 3. PASTE URL BUTTON (Alternative to export) */}
      <button
        onClick={() => {
          onCancel();
          window.open('/paste_avatar', '_blank');
        }}
        style={{
          position: "absolute", 
          top: 200,       // <--- Below the Close button
          right: 30, 
          padding: "12px 24px",
          background: "#28a745", 
          color: "white",
          borderRadius: "8px", 
          border: "none",
          fontWeight: "bold", 
          cursor: "pointer", 
          zIndex: 10000
        }}
      >
        📋 Paste URL Instead
      </button>

      {/* IFRAME */}
      <iframe
        ref={iframeRef}
        src="https://demo.readyplayer.me/avatar?frameApi"
        allow="camera *; microphone *; clipboard-read; clipboard-write; fullscreen *"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Avatar Creator"
      />
    </div>
  );
}