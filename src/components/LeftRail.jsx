import React from "react";
import { Z_GREEN } from "../constants";

const ICON = {
  home: "/image/home.png",
  filter: "/image/filter.png",
  create: "/image/post.png",
  promo: "/image/promotion.png",
};


const DEFAULT_AVATAR = "https://api.dicebear.com/9.x/thumbs/svg?seed=swozp";
const pickUserAvatar = (user) =>
  user?.user_metadata?.picture ||
  user?.user_metadata?.avatar_url ||
  user?.user_metadata?.photo_url ||
  user?.avatar_url || 
  null;

const withGoogleSize = (url, size = 128) => {
  if (!url) return url;
  return url.includes("googleusercontent")
    ? `${url}${url.includes("?") ? "&" : "?"}sz=${size}`
    : url;
};

export default function LeftRail({ onNavigate, user, activePage }) {
  const raw = pickUserAvatar(user);
  const avatar = withGoogleSize(raw, 128) || DEFAULT_AVATAR;

  return (
    <aside className="rail-left">
      {/* Home */}
      <button
        className={`rail-btn logo-btn ${activePage === "home" ? "is-active" : ""}`}
        onClick={() => onNavigate?.("home")}
        aria-label="หน้าหลัก"
        title="หน้าหลัก"
      >
        <img src={ICON.home} alt="home" className="icon-img" />
      </button>

      {/* Filter */}
      <button
        className={`rail-btn ${activePage === "filter" ? "is-active" : ""}`}
        onClick={() => onNavigate?.("filter")}
        aria-label="ฟิลเตอร์"
        title="ฟิลเตอร์"
      >
        <img src={ICON.filter} alt="filter" className="icon-img" />
      </button>

      {/* Create Post */}
      <button
        className={`rail-btn ${activePage === "createPost" ? "is-active" : ""}`}
        onClick={() => onNavigate?.("createPost")}
        aria-label="สร้างโพสต์"
        title="สร้างโพสต์"
      >
        <img src={ICON.create} alt="create" className="icon-img" />
      </button>

      {/* Promotions */}
      <button
        className={`rail-btn ${activePage === "promotion" ? "is-active" : ""}`}
        onClick={() => onNavigate?.("promotion")}
        aria-label="โปรโมชัน"
        title="โปรโมชัน"
      >
        <img src={ICON.promo} alt="promotion" className="icon-img" />
      </button>

      {/* Profile (รูป Gmail ปัจจุบัน) */}
      <button
        className={`rail-btn ${activePage === "profile" ? "is-active" : ""}`}
        onClick={() => onNavigate?.("profile")}
        aria-label="โปรไฟล์ของฉัน"
        title="โปรไฟล์ของฉัน"
        style={{ padding: 0, overflow: "hidden" }}
      >
        <img
          src={avatar}
          alt="me"
          className="user-ava"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_AVATAR; 
          }}
        />
      </button>
    </aside>
  );
}
