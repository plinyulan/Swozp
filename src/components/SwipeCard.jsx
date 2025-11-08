import React, { useCallback, useEffect, useRef, useState } from "react";

export default function SwipeCard({ post, onSwipe, user, onNavigate }) {
  const [imgIndex, setImgIndex] = useState(0);

  // ----- swipe states -----
  const cardRef = useRef(null);
  const [drag, setDrag] = useState({ dx: 0, dy: 0, active: false });
  const startRef = useRef({ x: 0, y: 0 });
  const animatingRef = useRef(false);

  // มีโพสต์ไหม + เตรียมรูป
  const hasPost = !!post;
  const images = hasPost && Array.isArray(post.images) ? post.images : [];

  // reset รูปเมื่อเปลี่ยนโพสต์ (hook นี้ต้องถูกเรียกเสมอ)
  useEffect(() => {
    setImgIndex(0);
  }, [post?.id]);

  // --------- handlers ที่เป็น hook ต้องประกาศก่อน return เสมอ ---------
  const animateOut = useCallback(
    (dir) => {
      if (animatingRef.current) return;
      animatingRef.current = true;

      const width = window.innerWidth || 1000;
      const toX = dir === "right" ? width : -width;

      const card = cardRef.current;
      if (!card) return;

      card.style.transition = "transform 300ms ease-out, opacity 300ms ease-out";
      card.style.transform = `translate(${toX}px, ${drag.dy}px) rotate(${toX / 15}deg)`;
      card.style.opacity = "0.3";

      window.setTimeout(() => {
        onSwipe(dir === "right");
        card.style.transition = "";
        card.style.transform = "";
        card.style.opacity = "";
        animatingRef.current = false;
        setDrag({ dx: 0, dy: 0, active: false });
      }, 310);
    },
    [drag.dy, onSwipe]
  );

  // คีย์บอร์ดช่วยทดสอบ (ต้องประกาศเสมอ ไม่ขึ้นกับ post)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") animateOut("left");
      if (e.key === "ArrowRight") animateOut("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [animateOut]);

  // ---- ที่เหลือไม่ใช่ hook เรียกแบบมีเงื่อนไขได้ ----
  const nextImg = () => images.length > 0 && setImgIndex((i) => (i + 1) % images.length);
  const prevImg = () => images.length > 0 && setImgIndex((i) => (i - 1 + images.length) % images.length);

  const onPointerDown = (e) => {
    if (e.target?.closest?.("[data-arrow]")) return; // ไม่ลากถ้ากดลูกศร
    e.target.setPointerCapture?.(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag({ dx: 0, dy: 0, active: true });
  };

  const onPointerMove = (e) => {
    if (!drag.active) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setDrag((d) => ({ ...d, dx, dy }));
  };

  const onPointerUp = () => {
    if (!drag.active) return;
    const THRESH_X = 130;
    const { dx } = drag;

    if (dx > THRESH_X) {
      animateOut("right");
    } else if (dx < -THRESH_X) {
      animateOut("left");
    } else {
      const card = cardRef.current;
      if (card) {
        card.style.transition = "transform 200ms ease-out";
        card.style.transform = "translate(0,0) rotate(0)";
        setTimeout(() => {
          if (card) {
            card.style.transition = "";
            card.style.transform = "";
          }
        }, 210);
      }
      setDrag({ dx: 0, dy: 0, active: false });
    }
  };

  // transform ตามการลาก
  const rotate = drag.dx / 15;
  const transform = `translate(${drag.dx}px, ${drag.dy}px) rotate(${rotate}deg)`;

  // ความเข้ม badge
  const likeOpacity = Math.min(Math.max((drag.dx - 20) / 120, 0), 1);
  const nopeOpacity = Math.min(Math.max((-drag.dx - 20) / 120, 0), 1);

  // ---------- UI ----------
  if (!hasPost) {
    return (
      <div className="text-gray-500 text-center">
        ไม่มีโพสต์แล้ว
        {user && (
          <button
            onClick={() => onNavigate("createPost")}
            className="block mt-4 px-4 py-2 text-white rounded-lg"
            style={{ background: "var(--zgreen)" }}
          >
            สร้างโพสต์แรก
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={cardRef}
        className="w-[320px] sm:w-[380px] md:w-[420px] rounded-3xl border bg-white shadow-md overflow-hidden select-none touch-none"
        style={{ transform }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* progress */}
        <div className="flex justify-center gap-2 py-3">
          {(images.length ? images : [0]).slice(0, 3).map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full ${i === imgIndex ? "w-10" : "w-6"} transition-all`}
              style={{ background: i === imgIndex ? "var(--zgreen)" : "#d1d5db" }}
            />
          ))}
        </div>

        {/* รูป */}
        <div className="relative">
          <img
            src={images[imgIndex]}
            alt={post.title}
            className="w-full h-[460px] object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                data-arrow
                onClick={(e) => { e.stopPropagation(); prevImg(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-8 h-8 rounded-full grid place-items-center"
                aria-label="ก่อนหน้า"
              >
                ‹
              </button>
              <button
                data-arrow
                onClick={(e) => { e.stopPropagation(); nextImg(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-8 h-8 rounded-full grid place-items-center"
                aria-label="ถัดไป"
              >
                ›
              </button>
            </>
          )}

          {/* LIKE / NOPE badge */}
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-lg border-2 font-bold tracking-wider"
            style={{ opacity: nopeOpacity, color: "#ef4444", borderColor: "#ef4444", transform: "rotate(-15deg)" }}
          >
            NOPE
          </div>
          <div
            className="absolute top-4 right-4 px-3 py-1 rounded-lg border-2 font-bold tracking-wider"
            style={{ opacity: likeOpacity, color: "var(--zgreen)", borderColor: "var(--zgreen)", transform: "rotate(15deg)" }}
          >
            LIKE
          </div>

          {/* โปรไฟล์ + หมวดหมู่ */}
          <div className="absolute bottom-24 left-4 flex items-center gap-2">
            <img
              src={post.profiles?.avatar_url || images?.[0]}
              alt=""
              className="w-12 h-12 rounded-full border object-cover"
            />
            <span className="text-white font-semibold drop-shadow">
              {post.profiles?.full_name || "User"}
            </span>
            {post.category && (
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ background: "var(--zgreen)" }}>
                {post.category}
              </span>
            )}
          </div>
        </div>

        {/* title/detail */}
        <div className="p-4">
          <div className="text-lg font-bold">{post.title}</div>
          <div className="text-gray-500 text-sm line-clamp-1">{post.detail}</div>
        </div>
      </div>

      {/* ปุ่มสำรอง (คลิกแทนลาก) */}
      <div className="flex justify-center gap-10 mt-6">
        <button
          onClick={() => animateOut("left")}
          className="w-16 h-16 rounded-full bg-red-500 grid place-items-center shadow-md"
          aria-label="ไม่สนใจ"
        >
          <span className="text-white text-3xl">✕</span>
        </button>
        <button
          onClick={() => animateOut("right")}
          className="w-16 h-16 rounded-full grid place-items-center shadow-md"
          style={{ background: "var(--zgreen)" }}
          aria-label="ชอบ"
        >
          <span className="text-white text-3xl">✓</span>
        </button>
      </div>
    </div>
  );
}
