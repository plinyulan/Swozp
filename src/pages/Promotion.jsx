import React, { useEffect, useState } from "react";
import LeftRail from "../components/LeftRail";
import { useAuth } from "../context/AuthContext";
import Chat from "./Chat";
import "./Home.css";
import "./Promotion.css";
import "./Chat.css";

export default function Promotion({ onNavigate }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("match");

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("swozp:matches");
      if (raw) setMatches(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const packages = [
    {
      title: "Good",
      price: 159,
      tagline: "The Perfect Start to a Better Experience",
      desc: `Begin your journey with a plan that offers value, simplicity, and essential features.
Good is designed for users who want to get started without overspending giving you access to basic match information and all the core functions you need to stay connected.
“A simple start that gives you more than you expect.” Every great experience begins with a smart first step.`,
      gradient: "pkg-grad-1",
    },
    {
      title: "Best",
      price: 200,
      tagline: "Upgrade for More Power and Value",
      desc: `Take your experience to the next level just a little more, but a lot better!
The Best plan includes added privileges like fee exemptions and deeper match insights, giving you the advantage of smarter decisions and more control over your journey.
“A small upgrade that makes a big difference.” Because true value means getting more than what you pay for.`,
      gradient: "pkg-grad-2",
    },
    {
      title: "Excellent",
      price: 300,
      tagline: "The Ultimate Premium Experience",
      desc: `For those who accept nothing less than the best, Excellent unlocks every exclusive benefit.
Enjoy advanced match data, priority updates, early-message features, and dedicated premium support everything you need for a complete, top-tier experience.
“Above every level for those who deserve only the finest.”`,
      gradient: "pkg-grad-3",
    },
  ];

  const onBuy = (pkgTitle) => {
    setSelectedPkg(pkgTitle);
    setShowModal(true);
  };

  const withSize = (url) => `${url}?size=96`;

  return (
    <div className="swozp-page">
      <div className="swozp-body">
        {/* ซ้าย */}
        <LeftRail onNavigate={onNavigate} user={user} activePage="promotion" />

        {/* กลาง */}
        <main className="pkg-center">
          <h2 className="pkg-title-page">Package</h2>
          {packages.map((p) => (
            <div key={p.title} className={`pkg-card ${p.gradient}`}>
              <div className="pkg-card__grid">
                <div className="pkg-left">
                  <h3 className="pkg-name">{p.title}</h3>
                  <p className="pkg-tagline">{p.tagline}</p>
                  <p className="pkg-desc">{p.desc}</p>
                </div>
                <div className="pkg-divider" />
                <div className="pkg-right">
                  <div className="pkg-price">
                    <span className="num">{p.price}</span>
                    <span className="unit"> ฿</span>
                  </div>
                  <button
                    className="pkg-btn"
                    style={{ background: "#9AE227" }}
                    onClick={() => onBuy(p.title)}
                  >
                    BUY
                  </button>
                </div>
              </div>
            </div>
          ))}
        </main>

        {/* ขวา — แท็บ Match / Message แบบหน้าโฮม */}
        <aside className="rail-right">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "match" ? "tab--active" : ""}`}
              onClick={() => setActiveTab("match")}
            >
              Match
            </button>
            <button
              className={`tab ${activeTab === "message" ? "tab--active" : ""}`}
              onClick={() => setActiveTab("message")}
            >
              Message
            </button>
          </div>

          {activeTab === "match" ? (
            <div className="grid6">
              {matches.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="slot" />
                  ))
                : matches.map((m, i) => (
                    <div key={m.id || i} className="slot">
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.title}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://api.dicebear.com/9.x/thumbs/svg?seed=swozp";
                          }}
                        />
                      ) : (
                        <span>{m.title?.[0] || "?"}</span>
                      )}
                    </div>
                  ))}
            </div>
          ) : (
            <Chat onNavigate={onNavigate} user={user} />
          )}
        </aside>
      </div>

      {/* ===== Modal ===== */}
      {showModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowModal(false)}
          aria-hidden="true"
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pkUnavailableTitle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-body">
              <h3 id="pkUnavailableTitle" className="modal-title">
                ขณะนี้ยังไม่เปิดให้บริการ
              </h3>
              <p className="modal-text">
                แพ็กเกจ <b>{selectedPkg}</b> ยังไม่พร้อมใช้งานในตอนนี้
                กรุณาลองใหม่อีกครั้งภายหลัง
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn-ok"
                onClick={() => setShowModal(false)}
                autoFocus
              >
                โอเค
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
