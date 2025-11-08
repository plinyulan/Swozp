import React from "react";
import IconButton from "./IconButton";

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="col-span-2 md:col-span-2 border-r min-h-[calc(100vh-64px)] pt-6 flex flex-col items-center">
      <div className="w-12 h-12 rounded-xl bg-black grid place-items-center mb-8">
        <span className="text-xl font-bold" style={{ color: "var(--zgreen)" }}>
          Z
        </span>
      </div>
      <div className="flex flex-col gap-6">
        <IconButton title="ตั้งค่า">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M4 6h11M4 12h16M4 18h7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </IconButton>

        <IconButton title="เพิ่มโพสต์" onClick={() => onNavigate?.("createPost")}>
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </IconButton>

        <IconButton title="รายการโปรด">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>
          </svg>
        </IconButton>

        <IconButton title="อื่นๆ">
          <span className="text-xl">🧴</span>
        </IconButton>
      </div>
    </aside>
  );
}
