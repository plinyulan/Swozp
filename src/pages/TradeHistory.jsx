import React, { useEffect, useState } from "react";
import { supabase } from "../userauth/supabase";


export default function TradeHistory({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ดึงข้อมูล user ปัจจุบัน
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    fetchUser();
  }, []);

  // ✅ โหลดรายการ trade ของ user + realtime
  useEffect(() => {
    if (!user) return;

    const fetchTrades = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trades")
        .select(
          `
          *,
          user1:profiles!trades_user1_id_fkey(full_name, avatar_url),
          user2:profiles!trades_user2_id_fkey(full_name, avatar_url),
          post1:posts!trades_user1_post_id_fkey(title, images),
          post2:posts!trades_user2_post_id_fkey(title, images)
        `
        )
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) console.error("fetchTrades error:", error);
      else setTrades(data || []);
      setLoading(false);
    };

    fetchTrades();

    // ✅ Realtime update
    const channel = supabase
      .channel("trades-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trades" },
        () => fetchTrades()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // ✅ แปลงสถานะให้อ่านง่าย
  const renderStatus = (state) => {
    switch (state) {
      case "waiting":
        return "⏳ pending";
      case "accepted":
        return "✅ accepted";
      case "shipping":
        return "🚚 shipping";
      case "completed":
        return "🎉 completed";
      default:
        return "❔ unknown";
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">กำลังโหลดข้อมูล...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 🔹 ปุ่มกลับ */}
      <button
        onClick={() => onNavigate("chat")}
        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mb-6"
      >
        ← กลับไปแชท
      </button>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        📜 ประวัติการแลกเปลี่ยนของคุณ
      </h2>

      {trades.length === 0 ? (
        <p className="text-gray-500 text-center">ยังไม่มีประวัติการแลก</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trades.map((trade) => {
            const isUser1 = trade.user1_id === user.id;
            const partner = isUser1 ? trade.user2 : trade.user1;
            const partnerItem = isUser1 ? trade.post2 : trade.post1;

            // ✅ ดึงรูปจาก images array (bucket post-images)
            const imageUrl =
              partnerItem?.images?.[0] ||
              "https://via.placeholder.com/150?text=No+Image";

            return (
              <div
                key={trade.id}
                className="bg-white shadow rounded-xl p-4 border hover:shadow-md transition"
              >
                {/* 🔹 หัว */}
                <div className="flex items-center gap-3 mb-3 border-b pb-2">
                  <img
                    src={
                      partner?.avatar_url ||
                      "https://via.placeholder.com/60?text=User"
                    }
                    alt="partner"
                    className="w-10 h-10 rounded-full border"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      คุณแลกกับ: {partner?.full_name || "ไม่ทราบชื่อ"}
                    </p>
                    <p className="text-sm text-gray-500">
                      วันที่:{" "}
                      {new Date(trade.created_at).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </div>

                {/* 🔹 รายการของคู่แลก */}
                <div className="text-center mb-3">
                  <img
                    src={imageUrl}
                    alt={partnerItem?.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm font-medium text-gray-700">
                    ของคู่แลก: {partnerItem?.title || "-"}
                  </p>
                </div>

                {/* 🔹 สถานะ */}
                <p className="text-center mt-2 font-semibold">
                  สถานะปัจจุบัน:{" "}
                  <span className="text-blue-600">
                    {renderStatus(trade.state)}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}