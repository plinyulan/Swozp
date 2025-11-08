import React from "react";

export default function IconButton({ title, onClick, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-12 h-12 rounded-xl border grid place-items-center hover:bg-gray-50 active:translate-y-px transition"
    >
      <span className="text-gray-700">{children}</span>
    </button>
  );
}

