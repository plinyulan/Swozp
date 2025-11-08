import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../userauth/supabase";
import { Z_GREEN } from "../constants";
import LeftRail from "../components/LeftRail";
import "./Filter.css";

export default function Filter({ onNavigate }) {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [, setMatches] = useState([]);

  // หมวดทั้งหมด
  const interests = [
    { id: "ทั้งหมด", label: "ทั้งหมด", img: "image/ของใช้ทั่วไป.png" },
    { id: "ทั่วไป", label: "ทั่วไป", img: "image/ของใช้ทั่วไป.png" },
    { id: "อุปกรณ์อิเล็กทรอนิกส์", label: "อุปกรณ์อิเล็กทรอนิกส์", img: "/image/อุปกรณ์อิเล็กทรอนิกส์.png" },
    { id: "หนังสือ", label: "หนังสือ", img: "image/Book.jpg" },
    { id: "แฟชั่น", label: "แฟชั่น", img: "image/fasion.png" },
    { id: "ของแต่งบ้าน", label: "ของแต่งบ้าน", img: "/image/ของแต่งบ้าน.png" },
    { id: "กีฬา", label: "กีฬา", img: "/image/กีฬา.png" },
    { id: "เครื่องใช้ไฟฟ้า", label: "เครื่องใช้ไฟฟ้า", img: "/image/ของใช้ในบ้าน.png" },
    { id: "ของสะสม", label: "ของสะสม", img: "/image/Collectibles.jpg" },
  ];

  // เริ่มต้นเลือกทุกหมวด (ยกเว้น “ทั้งหมด”)
  const categoryIds = interests.filter(i => i.id !== "ทั้งหมด").map(i => i.id);
  const [pickedCats, setPickedCats] = useState(categoryIds);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPosts();
    try {
      const raw = localStorage.getItem("swozp:matches");
      if (raw) setMatches(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // โหลดโพสต์เมื่อเปลี่ยนตัวกรอง
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedCats, search]);

  // โหลดโพสต์ + กรอง
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("posts")
        .select("*, profiles(full_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (pickedCats.length > 0 && pickedCats.length < categoryIds.length) {
        q = q.in("category", pickedCats);
      }

      const s = search.trim();
      if (s) q = q.or(`title.ilike.%${s}%,detail.ilike.%${s}%`);

      const { data, error } = await q;
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

  // toggle หมวด
  const toggleCat = (id) => {
    if (id === "ทั้งหมด") {
      setPickedCats(prev =>
        prev.length === categoryIds.length ? [] : categoryIds
      );
      return;
    }
    setPickedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getUserAvatar = () => {
    const metaAvatar =
      user?.user_metadata?.picture ||
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.photo_url;
    const profileAvatar = user?.avatar_url;
    return metaAvatar || profileAvatar || "https://api.dicebear.com/9.x/thumbs/svg?seed=swozp";
  };

  const withSize = (url) => {
    if (!url) return null;
    return url.includes("googleusercontent")
      ? `${url}${url.includes("?") ? "&" : "?"}sz=128`
      : url;
  };

  return (
    <div className="swozp-page">
      <div className="swozp-body">
        <LeftRail onNavigate={onNavigate} user={user} activePage="filter" />

        {/* Center */}
        <main className="center">
          {loading ? (
            <div className="loading">กำลังโหลด...</div>
          ) : !current ? (
            <div className="empty">
              <p>ยังไม่มีโพสต์ให้ดูในตัวกรองนี้</p>
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
              <div className="progress">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className={`dot ${i === 0 ? "dot--active" : ""}`} />
                ))}
              </div>

              <div className="card">
                <button className="arrow left" onClick={onPrev}>‹</button>
                <button className="arrow right" onClick={onNext}>›</button>

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
                  <div className="owner">
                    <img
                      className="owner-ava"
                      src={
                        withSize(current?.profiles?.avatar_url || getUserAvatar()) ||
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
                      <span className="owner-badge" style={{ background: Z_GREEN }}>
                        {current.category || "ทั่วไป"}
                      </span>
                    </div>
                  </div>

                  <div className="item">
                    <div className="item-title">{current.title || "ชื่อสินค้า"}</div>
                    <div className="item-sub">
                      {current.detail?.slice(0, 60) || "รายละเอียดสินค้า"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="actions">
                <button className="circle-btn circle-btn--danger" onClick={onNext}>✕</button>
                <button className="circle-btn circle-btn--success" onClick={onNext}>✓</button>
              </div>
            </div>
          )}
        </main>

        {/* Right: Interest */}
        <aside className="right">
          <h2 className="right__title">Interest</h2>

          <div className="search">
            <svg className="search__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm11 3-6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              className="search__input"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="interest-grid">
            {interests.map((cat) => {
              const allOn = pickedCats.length === categoryIds.length;
              const active = cat.id === "ทั้งหมด" ? allOn : pickedCats.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCat(cat.id)}
                  className={`interest-tile ${active ? "is-active" : ""}`}
                >
                  <img src={cat.img} alt={cat.label} className="interest-tile__img" />
                  <span className="interest-tile__label">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
