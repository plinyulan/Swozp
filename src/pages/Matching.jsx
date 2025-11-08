import React, { useState, useEffect } from "react";
import LeftRail from "../components/LeftRail";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../userauth/supabase";

export default function Matching({ onNavigate }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // ✅ ดึงโพสต์ที่ผู้ใช้ปัดไปแล้ว
      const { data: swipedRows } = await supabase
        .from("user_swipes")
        .select("post_id")
        .eq("swiper_id", user.id);

      const swipedIds = (swipedRows || []).map((r) => r.post_id);

      // ✅ ดึงโพสต์ทั้งหมดที่ไม่ใช่ของตัวเอง
      const { data: allPosts, error } = await supabase
        .from("posts")
        .select("*, profiles(full_name, avatar_url)")
        .neq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // ✅ เอาเฉพาะโพสต์ที่ยังไม่ได้ปัด
      const filtered = (allPosts || []).filter((p) => !swipedIds.includes(p.id));
      setPosts(filtered);
    } catch (err) {
      console.error("fetchPosts error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ฟังก์ชันปัด (like/dislike)
  const handleSwipe = async (post, isLike) => {
    try {
      await supabase.from("user_swipes").insert([
        {
          swiper_id: user.id,
          swiped_user_id: post.user_id,
          post_id: post.id,
          is_like: isLike,
        },
      ]);
    } catch (err) {
      console.error("swipe insert error:", err);
      alert("เกิดข้อผิดพลาดขณะบันทึกการปัด");
    } finally {
      setCurrentIndex((s) => s + 1);
    }
  };

  const currentPost = posts[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <LeftRail onNavigate={onNavigate} />

      <div className="max-w-3xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">ค้นหาสินค้าที่ถูกใจ</h2>

        {loading ? (
          <p>กำลังโหลดโพสต์...</p>
        ) : posts.length === 0 || !currentPost ? (
          <p className="text-gray-500 text-center">คุณดูครบทุกโพสต์แล้ว</p>
        ) : (
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            {/* ✅ แสดงรูปให้รองรับทั้ง images array หรือ image_url string */}
            <img
              src={
                Array.isArray(currentPost.images)
                  ? currentPost.images[0]
                  : currentPost.image_url || "https://via.placeholder.com/400"
              }
              alt={currentPost.title}
              className="w-full h-72 object-cover rounded-md mb-4"
            />

            <h3 className="text-xl font-semibold mb-1">{currentPost.title}</h3>
            <p className="text-gray-600 mb-3">{currentPost.detail}</p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <img
                src={currentPost.profiles?.avatar_url || "https://via.placeholder.com/40"}
                alt={currentPost.profiles?.full_name}
                className="w-8 h-8 rounded-full border"
              />
              <span className="text-sm text-gray-600">
                {currentPost.profiles?.full_name || "ไม่ทราบชื่อ"}
              </span>
            </div>

            <div className="flex justify-around mt-4">
              <button
                className="bg-red-500 text-white rounded-full w-14 h-14 text-xl"
                onClick={() => handleSwipe(currentPost, false)}
              >
                ✖
              </button>
              <button
                className="bg-green-500 text-white rounded-full w-14 h-14 text-xl"
                onClick={() => handleSwipe(currentPost, true)}
              >
                ❤️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
