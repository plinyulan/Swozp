import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../userauth/supabase";
import { Z_GREEN } from "../constants";
import LeftRail from "../components/LeftRail";
import Chat from "./Chat";
import "./Home.css";

export default function Home({ onNavigate }) {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("match"); // ✅ เพิ่ม state สำหรับสลับแท็บ

  useEffect(() => {
    fetchPosts();
    try {
      const raw = localStorage.getItem("swozp:matches");
      if (raw) setMatches(JSON.parse(raw));
    } catch {}
  }, []);

  // ✅ ดึงโพสต์ทั้งหมดพร้อมโปรไฟล์
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(full_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPosts(data || []);
      setIndex(0);
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการโหลดโพสต์");
    } finally {
      setLoading(false);
    }
  };

  const current = useMemo(() => posts[index] || null, [posts, index]);
  const onPrev = () => setIndex((i) => (i > 0 ? i - 1 : i));
  const onNext = () => setIndex((i) => (i < posts.length - 1 ? i + 1 : i));

  // ✅ กดถูกใจ / แมตช์
  const onLike = () => {
    if (current) {
      setMatches((m) => {
        const next = m.find((x) => x.id === current.id)
          ? m
          : [
              {
                id: current.id,
                avatar: current?.profiles?.avatar_url,
                title: current.title,
              },
              ...m,
            ].slice(0, 6);
        localStorage.setItem("swozp:matches", JSON.stringify(next));
        return next;
      });
    }
    onNext();
  };

  // ✅ ฟังก์ชันช่วยดึงรูปโปรไฟล์ของ user ที่ล็อกอิน (จาก Gmail)
  const getUserAvatar = () => {
    const metaAvatar =
      user?.user_metadata?.picture ||
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.photo_url;

    const profileAvatar = user?.avatar_url;

    return (
      metaAvatar ||
      profileAvatar ||
      "https://api.dicebear.com/9.x/thumbs/svg?seed=swozp"
    );
  };

  // ✅ helper สำหรับปรับขนาดรูป googleusercontent
  const withSize = (url) => {
    if (!url) return null;
    return url.includes("googleusercontent")
      ? `${url}${url.includes("?") ? "&" : "?"}sz=128`
      : url;
  };

  return (
    <div className="swozp-page">
      <div className="swozp-body">
        <LeftRail onNavigate={onNavigate} user={user} activePage="home" />

        {/* === กลาง: การ์ดหลัก === */}
        <main className="center">
          {loading ? (
            <div className="loading">กำลังโหลด...</div>
          ) : !current ? (
            <div className="empty">
              <p>ยังไม่มีโพสต์ให้ดูในหมวดนี้</p>
              <button
                className="primary-btn"
                style={{ background: Z_GREEN }}
                onClick={() => onNavigate?.("createPost")}
              >
                สร้างโพสต์แรก
              </button>
            </div>
          ) : (
            <div className="card-area">
              {/* progress dots */}
              <div className="progress">
                {posts.slice(0, 4).map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === index % 4 ? "dot--active" : ""}`}
                  />
                ))}
              </div>

              {/* card */}
              <div className="card">
                <button className="arrow left" onClick={onPrev}>
                  ‹
                </button>
                <button className="arrow right" onClick={onNext}>
                  ›
                </button>

                <div className="card-media">
                  <img
                    src={
                      (current.images && current.images[0]) ||
                      "https://images.unsplash.com/photo-1520975922203-b88c0d4d6a68?q=80&w=1200&auto=format&fit=crop"
                    }
                    alt={current.title}
                  />
                </div>

                <div className="card-overlays">
                  {/* owner */}
                  <div className="owner">
                    <img
                      className="owner-ava"
                      src={
                        withSize(
                          current?.profiles?.avatar_url || getUserAvatar()
                        ) ||
                        "https://api.dicebear.com/9.x/thumbs/svg?seed=swozp"
                      }
                      alt={current?.profiles?.full_name || "user"}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://api.dicebear.com/9.x/thumbs/svg?seed=swozp";
                      }}
                    />
                    <div className="owner-text">
                      <div className="owner-name">
                        {current?.profiles?.full_name || "ผู้ใช้"}
                      </div>
                      <span
                        className="owner-badge"
                        style={{ background: Z_GREEN }}
                      >
                        {current.category || "ทั่วไป"}
                      </span>
                    </div>
                  </div>

                  {/* item info */}
                  <div className="item">
                    <div className="item-title">
                      {current.title || "ชื่อสินค้า"}
                    </div>
                    <div className="item-sub">
                      {current.detail?.slice(0, 60) || "รายละเอียดสินค้า"}
                    </div>
                  </div>
                </div>
              </div>

              {/* actions */}
              <div className="actions">
                <button
                  className="circle-btn circle-btn--danger"
                  onClick={onNext}
                >
                  ✕
                </button>
                <button
                  className="circle-btn circle-btn--success"
                  onClick={onLike}
                >
                  ✓
                </button>
              </div>
            </div>
          )}
        </main>

        {/* === ฝั่งขวา: Match / Message === */}
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

          {/* ✅ ถ้าเลือก Match */}
          {activeTab === "match" ? (
            <div className="grid6">
              {matches.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="slot" />
                  ))
                : matches.map((m) => (
                    <div key={m.id} className="slot">
                      {m.avatar ? (
                        <img
                          src={withSize(m.avatar)}
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
            // ✅ ถ้าเลือก Message → แสดง Chat ในกล่องนี้แทน
            <div className="chat-container">
              <Chat onNavigate={onNavigate} inline />

            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
