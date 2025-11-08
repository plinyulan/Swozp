import React from 'react';

const Z_GREEN = "#00C853";

export default function Logo({ size = 36, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background: Z_GREEN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 800,
        }}
      >
        S
      </div>
      <div style={{ fontWeight: 800, color: "#000" }}>SWOZP</div>
    </div>
  );
}