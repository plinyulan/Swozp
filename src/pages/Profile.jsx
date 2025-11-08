// src/pages/Profile.jsx
import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import LeftRail from "../components/LeftRail";
import Chat from "./Chat"; // ใช้งานจริง
import { useAuth } from "../context/AuthContext";
import { supabase } from "../userauth/supabase";
import "./Profile.css";

export default function Profile({ onNavigate }) {
  const { user } = useAuth();

  // ---------- State ----------
  const [profile, setProfile] = useState(null);
  const [tempProfile, setTempProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [posts, setPosts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("match"); // "match" | "message"

  // ---------- Helpers ----------
  const withSize = (url, w = 120) => {
    if (!url) return url;
    if (url.includes("googleusercontent")) {
      return url.replace(/=s\d+-c.*$/, "") + `=s${w}-c`;
    }
    return url;
  };

  const coverOf = (p) =>
    p?.cover_url ||
    (Array.isArray(p?.images) && p.images[0]) ||
    "https://via.placeholder.com/300x200";

  // ---------- Effects ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem("swozp:matches");
      if (raw) setMatches(JSON.parse(raw));
    } catch {}
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) {
      console.error("Error loading profile:", error);
    } else {
      setProfile(data);
      setTempProfile(data);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchPosts = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,name,brand,images,cover_url,created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) {
      console.error("Error loading posts:", error);
    } else {
      setPosts(data || []);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPosts();
    }
  }, [user, fetchProfile, fetchPosts]);

  // ---------- Handlers ----------
  const handleUploadAvatar = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user?.id) return;

      setUploading(true);
      const ext = file.name.split(".").pop();
      const filePath = `avatars/${user.id}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      setTempProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      console.error("Upload error:", err.message);
      alert("ไม่สามารถอัปโหลดรูปได้: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!tempProfile?.full_name?.trim()) {
      alert("กรุณากรอกชื่อ");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: tempProfile.full_name,
        avatar_url: tempProfile.avatar_url,
        phone: tempProfile.phone,
      })
      .eq("id", user.id);
    setLoading(false);

    if (error) {
      console.error("Error updating profile:", error);
      alert("❌ เกิดข้อผิดพลาด: " + error.message);
    } else {
      setProfile(tempProfile);
      setIsEditing(false);
      alert("✅ บันทึกข้อมูลเรียบร้อยแล้ว!");
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onNavigate?.("login");
    } catch (e) {
      console.error(e);
    }
  };

  // ---------- Loading ----------
  if (!profile) {
    return (
      <div className="profile-page">
        <Navbar page="profile" onNavigate={onNavigate} />
        <div className="p-6 text-center">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="profile-page">
      <Navbar page="profile" onNavigate={onNavigate} />

      <div className="swozp-body">
        {/* Left */}
        <LeftRail onNavigate={onNavigate} user={user} activePage="profile" />

        {/* Center */}
        <main>
          <div className="profile-card">
            <h2 className="title">โปรไฟล์ของฉัน</h2>

            <img
              src={
                (isEditing ? tempProfile?.avatar_url : profile?.avatar_url) ||
                "https://via.placeholder.com/160"
              }
              alt="avatar"
              className="avatar"
            />

            {isEditing ? (
              <label className="change-photo">
                {uploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
                <input type="file" accept="image/*" onChange={handleUploadAvatar} hidden />
              </label>
            ) : null}

            {!isEditing ? (
              <>
                <div className="fields">
                  <div className="field">
                    <span className="field__label">Username</span>
                    <input type="text" value={profile.full_name || "-"} disabled />
                  </div>
                  <div className="field">
                    <span className="field__label">Email</span>
                    <input type="text" value={user.email || "-"} disabled />
                  </div>
                  <div className="field">
                    <span className="field__label">Tel.</span>
                    <input type="text" value={profile.phone || "-"} disabled />
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <button onClick={() => setIsEditing(true)} className="btn btn--primary">
                   แก้ไขโปรไฟล์
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="fields">
                  <div className="field">
                    <span className="field__label">Username</span>
                    <input
                      type="text"
                      value={tempProfile.full_name || ""}
                      onChange={(e) =>
                        setTempProfile((prev) => ({ ...prev, full_name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="field">
                    <span className="field__label">Email</span>
                    <input type="text" value={user.email} disabled />
                  </div>
                  <div className="field">
                    <span className="field__label">Tel.</span>
                    <input
                      type="text"
                      value={tempProfile.phone || ""}
                      onChange={(e) =>
                        setTempProfile((prev) => ({ ...prev, phone: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-3" style={{ marginTop: 16 }}>
                  <button onClick={handleCancel} className="btn btn--cancel">
                     ยกเลิก
                  </button>
                  <button onClick={handleSave} disabled={loading} className="btn btn--save">
                    {loading ? "กำลังบันทึก..." : "บันทึก"}
                  </button>
                </div>
              </>
            )}

            {/* Post history */}
            <div className="post-history">
              <h4>ประวัติการโพสต์</h4>
              <div className="post-grid">
                {posts.map((p) => (
                  <div key={p.id} className="post-card" onClick={() => onNavigate?.("home")}>
                    <img src={coverOf(p)} alt={p.title || p.name || "post"} />
                    <div className="caption">{p.name || p.title || "โพสต์"}</div>
                  </div>
                ))}
                <button
                  className="post-add"
                  onClick={() => onNavigate?.("post")}
                  aria-label="เพิ่มโพสต์"
                  title="เพิ่มโพสต์"
                >
                  <div className="plus">＋</div>
                </button>
              </div>
            </div>

            {/* Logout */}
            <div className="logout-wrap">
              <button className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>
        </main>

        {/* Right */}
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
                ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="slot" />)
                : matches.map((m, idx) => (
                    <div
                      key={m.id || m.title || m.avatar || idx}
                      className="slot"
                      title={m?.title || "match"}
                    >
                      {m?.avatar ? (
                        <img
                          src={withSize(m.avatar)}
                          alt={m.title || "match"}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://api.dicebear.com/9.x/thumbs/svg?seed=swozp";
                          }}
                        />
                      ) : (
                        <span>{m?.title?.[0] || "?"}</span>
                      )}
                    </div>
                  ))}
            </div>
          ) : (
            <div className="chat-container">
              <Chat onNavigate={onNavigate} user={user} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
