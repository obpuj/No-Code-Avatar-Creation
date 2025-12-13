"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasteAvatarPage() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateUrl = (url) => {
    // Check if it's a valid Ready Player Me URL
    const readyPlayerMePattern = /^https?:\/\/(models\.)?readyplayer\.me\/[a-zA-Z0-9]+\.glb$/;
    const generalGlbPattern = /\.glb$/;
    
    if (!url.trim()) {
      return { valid: false, message: 'Please enter an avatar URL' };
    }
    
    if (readyPlayerMePattern.test(url.trim())) {
      return { valid: true, message: '' };
    }
    
    if (generalGlbPattern.test(url.trim())) {
      return { valid: true, message: 'Note: This is not a Ready Player Me URL, but will be used anyway' };
    }
    
    return { valid: false, message: 'Please enter a valid .glb file URL (e.g., https://models.readyplayer.me/...)' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validation = validateUrl(avatarUrl);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setIsValidating(true);
    
    // Optional: Test if the URL is accessible
    try {
      const response = await fetch(avatarUrl.trim(), { method: 'HEAD' });
      if (!response.ok && response.status !== 405) { // 405 is Method Not Allowed, but URL exists
        throw new Error('Avatar file not found');
      }
    } catch (err) {
      console.warn('Could not verify URL:', err);
      // Continue anyway - might be CORS issue
    }

    // Navigate to avatar page with the URL
    const encodedUrl = encodeURIComponent(avatarUrl.trim());
    router.push(`/avatar_page?avatar=${encodedUrl}`);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAvatarUrl(text);
        setError('');
      }
    } catch (err) {
      console.log('Could not read clipboard:', err);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0c0f",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <div style={{
        background: "rgba(20, 20, 20, 0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "40px",
        maxWidth: 600,
        width: "100%",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
      }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            marginBottom: 10,
            background: "linear-gradient(135deg, #0070f3, #7928ca)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Paste Avatar URL
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 14,
            lineHeight: 1.6,
            margin: 0
          }}>
            After creating your avatar in Ready Player Me, copy the avatar URL and paste it here to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)"
            }}>
              Avatar URL
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  setError('');
                }}
                placeholder="https://models.readyplayer.me/your-avatar-id.glb"
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "rgba(0,0,0,0.3)",
                  border: error ? "2px solid #e23b3b" : "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "monospace",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0070f3"}
                onBlur={(e) => e.target.style.borderColor = error ? "#e23b3b" : "rgba(255,255,255,0.2)"}
              />
              <button
                type="button"
                onClick={handlePaste}
                style={{
                  padding: "14px 20px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.15)"}
                onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
              >
                📋 Paste
              </button>
            </div>
            {error && (
              <div style={{
                marginTop: 8,
                padding: "10px",
                background: "rgba(226, 59, 59, 0.1)",
                border: "1px solid rgba(226, 59, 59, 0.3)",
                borderRadius: "6px",
                color: "#ff6b6b",
                fontSize: 13
              }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              disabled={isValidating || !avatarUrl.trim()}
              style={{
                flex: 1,
                padding: "14px 24px",
                background: isValidating || !avatarUrl.trim() 
                  ? "rgba(0, 112, 243, 0.3)" 
                  : "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: 16,
                fontWeight: 600,
                cursor: isValidating || !avatarUrl.trim() ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => {
                if (!isValidating && avatarUrl.trim()) {
                  e.target.style.background = "#0051cc";
                }
              }}
              onMouseLeave={(e) => {
                if (!isValidating && avatarUrl.trim()) {
                  e.target.style.background = "#0070f3";
                }
              }}
            >
              {isValidating ? "Loading..." : "Continue to Avatar"}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                padding: "14px 24px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.15)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{
          marginTop: 30,
          padding: "20px",
          background: "rgba(0, 112, 243, 0.1)",
          border: "1px solid rgba(0, 112, 243, 0.2)",
          borderRadius: "8px"
        }}>
          <h3 style={{
            fontSize: 14,
            fontWeight: 600,
            margin: 0,
            marginBottom: 10,
            color: "#4dabf7"
          }}>
            How to get your avatar URL:
          </h3>
          <ol style={{
            margin: 0,
            paddingLeft: 20,
            color: "rgba(255,255,255,0.8)",
            fontSize: 13,
            lineHeight: 1.8
          }}>
            <li>Create your avatar in Ready Player Me</li>
            <li>After customization, click "Done" or "Export"</li>
            <li>Copy the avatar URL from the export dialog or address bar</li>
            <li>Paste it in the field above and click "Continue to Avatar"</li>
          </ol>
        </div>

        <div style={{
          marginTop: 20,
          padding: "15px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          fontSize: 12,
          color: "rgba(255,255,255,0.6)"
        }}>
          <strong>Example URL format:</strong><br/>
          <code style={{
            display: "block",
            marginTop: 5,
            padding: "8px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: 11,
            wordBreak: "break-all"
          }}>
            https://models.readyplayer.me/693c506ae37c2412ef8ca50f.glb
          </code>
        </div>
      </div>
    </div>
  );
}

