import React, { useState } from "react";
/* import Navbar from "../components/Navbar"; */
import { useAuth } from "../context/AuthContext";
import { supabase } from "../userauth/supabase";
import { Z_GREEN } from "../constants";
import LeftRail from "../components/LeftRail";
import "./CreatePost.css";

export default function CreatePost({ onNavigate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [maxDesc] = useState(100);
  const [formData, setFormData] = useState({
    title: "",
    category: "ทั่วไป",
    location: "",
    detail: "",
    images: [],
  });

  const categories = [
    "ทั้งหมด",
    "ทั่วไป",
    "อุปกรณ์อิเล็กทรอนิกส์",
    "หนังสือ",
    "แฟชั่น",
    "ของแต่งบ้าน",
    "กีฬา",
    "เครื่องใช้ไฟฟ้า",
    "ของสะสม",
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, event.target.result],
        }));
      };
      reader.readAsDataURL(file);
    });
    // เลือกไฟล์เดิมซ้ำได้
    if (e.target) e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("กรุณาใส่ชื่อสิ่งของ");
      return;
    }
    if (!formData.detail.trim() && formData.images.length === 0) {
      alert("ใส่คำบรรยายหรือเลือกรูปอย่างน้อย 1 อย่าง");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("posts").insert([
        {
          user_id: user.id,
          title: formData.title || "(ไม่มีชื่อ)",
          category: formData.category,
          location: formData.location,
          detail: formData.detail,
          images: formData.images,
        },
      ]);
      if (error) throw error;
      alert("สร้างโพสต์สำเร็จ!");
      onNavigate?.("home");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="create-shell">
        <LeftRail onNavigate={onNavigate} user={user} activePage="CreatePost" />
        <div className="login-wall">
          <h2>กรุณาเข้าสู่ระบบ</h2>
          <button
            onClick={() => onNavigate?.("login")}
            className="btn-login"
            style={{ background: Z_GREEN }}
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  const avatar =
    user?.user_metadata?.avatar_url ||
    "https://api.dicebear.com/9.x/thumbs/svg?seed=swozp";
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "memy";

  return (
    <div className="create-shell">
      <LeftRail onNavigate={onNavigate} user={user} activePage="CreatePost" />

      {/* โครงหลัก: ซ้าย(รูป 3 ช่อง) | ขวา(ฟอร์ม) */}
      <div className="create-two">
        {/* ซ้าย: รูป */}
        <section className="create-left">
          <h2 className="create-title">Insert picture</h2>

          {/* input file (ซ่อน) */}
          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />

          <div className="upload-grid">
            {Array.from({ length: 3 }).map((_, idx) => {
              const img = formData.images[idx];
              if (img) {
                return (
                  <div className="upload-card" key={`img-${idx}`}>
                    <img src={img} alt={`img-${idx}`} className="upload-img" />
                    <button
                      type="button"
                      className="upload-remove"
                      onClick={() => removeImage(idx)}
                      aria-label="ลบรูป"
                    >
                      ×
                    </button>
                  </div>
                );
              }
              return (
                <label
                  key={`ph-${idx}`}
                  className="upload-card"
                  htmlFor="image-input"
                  title="เพิ่มรูปภาพ"
                >
                  <div className="upload-plus">+</div>
                </label>
              );
            })}
          </div>
        </section>

        {/* ขวา: ฟอร์ม */}
        <form className="create-right" onSubmit={handleSubmit}>
          {/* โปรไฟล์ (ถ้าต้องการ) */}
          <div className="profile-row">
            <img src={avatar} alt="avatar" />
            <div className="profile-name">{displayName}</div>
          </div>

          <div className="form-block">
            <label className="form-label">ชื่อสิ่งของ *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="form-input"
              placeholder="เช่น iPhone 13 Pro"
              required
            />
          </div>

          <div className="form-block">
            <label className="form-label">หมวดหมู่</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="form-input"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-block">
            <label className="form-label">จังหวัด</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="form-input"
              placeholder="เช่น กรุงเทพมหานคร"
            />
          </div>

          <div className="form-block">
            <label className="form-label">รายละเอียด</label>
            <textarea
              value={formData.detail}
              onChange={(e) =>
                setFormData({ ...formData, detail: e.target.value })
              }
              className="form-textarea"
              rows="4"
              placeholder="อธิบายสิ่งของของคุณ..."
              maxLength={maxDesc}
            />
            <div className="char-count">
              {formData.detail.length}/{maxDesc}
            </div>
          </div>

          <div className="action-row">
            <button
              type="button"
              onClick={() => onNavigate?.("home")}
              className="btn cancel"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn primary"
              style={{ background: Z_GREEN }}
              disabled={loading}
            >
              {loading ? "กำลังสร้าง..." : "สร้างโพสต์"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
