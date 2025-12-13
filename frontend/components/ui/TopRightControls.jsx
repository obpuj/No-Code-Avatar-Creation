"use client";

export default function TopRightControls({ onSelect }) {
  const btnStyle = {
    padding: "10px 18px",
    borderRadius: "999px",
    background: "rgba(255, 0, 0, 0.15)",
    border: "1px solid rgba(255, 0, 0, 0.35)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    letterSpacing: "0.4px",
    transition: "0.2s ease",
  };

  const hoverStyle = {
    background: "rgba(255, 40, 40, 0.35)",
    border: "1px solid rgba(255, 80, 80, 0.75)",
    boxShadow: "0 0 12px rgba(255, 0, 0, 0.5)",
  };

  return (
    <div style={{ display: "flex", gap: "14px" }}>
      {/* COMMUNITY / SEARCH */}
      <button
        style={btnStyle}
        onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.target.style, btnStyle)}
        onClick={() => onSelect("search")}
      >
         Community
      </button>

      {/* SUPPORT */}
      <button
        style={btnStyle}
        onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.target.style, btnStyle)}
        onClick={() => onSelect("support")}
      >
         Support
      </button>

      {/* LOGIN */}
      <button
        style={btnStyle}
        onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.target.style, btnStyle)}
        onClick={() => onSelect("login")}
      >
         Login
      </button>
    </div>
  );
}
