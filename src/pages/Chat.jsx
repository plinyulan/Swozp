import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../userauth/supabase";
import "./Chat.css";

export default function Chat({ onNavigate, inline = false }) {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [match, setMatch] = useState(null);
  const [trade, setTrade] = useState(null);
  const [messages, setMessages] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPartnerPost, setSelectedPartnerPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    fetchUser();
  }, []);

  // Fetch match data (memoized)
  const fetchMatchData = useCallback(async () => {
    if (!user) return;

    const { data: matchData } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!matchData) {
      setMatch(null);
      setPartner(null);
      setMessages([]);
      setTrade(null);
      setLikedPosts([]);
      setLoading(false);
      return;
    }
    setMatch(matchData);

    const partnerId =
      matchData.user1_id === user.id ? matchData.user2_id : matchData.user1_id;

    const { data: partnerData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", partnerId)
      .single();
    setPartner(partnerData);

    const { data: swipes } = await supabase
      .from("user_swipes")
      .select("post_id")
      .eq("swiper_id", user.id)
      .eq("swiped_user_id", partnerId)
      .eq("is_like", true);

    const likedIds = swipes?.map((s) => s.post_id) || [];
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .in("id", likedIds);
    setLikedPosts(posts || []);

    const allPostIds = [matchData.post1_id, matchData.post2_id].filter(Boolean);
    let matchPostsMap = {};
    if (allPostIds.length > 0) {
      const { data: matchPosts } = await supabase
        .from("posts")
        .select("id, title")
        .in("id", allPostIds);
      if (matchPosts) {
        matchPostsMap = Object.fromEntries(matchPosts.map((p) => [p.id, p.title]));
      }
    }
    setMatch((prev) => ({
      ...prev,
      post1_title: matchPostsMap[matchData.post1_id] || null,
      post2_title: matchPostsMap[matchData.post2_id] || null,
    }));

    const { data: msgData } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchData.id)
      .order("created_at", { ascending: true });
    setMessages(msgData || []);

    const { data: tradeData } = await supabase
      .from("trades")
      .select("*")
      .eq("match_id", matchData.id)
      .maybeSingle();
    setTrade(tradeData || null);

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMatchData(); }, [fetchMatchData]);

  useEffect(() => {
    if (!match?.id) return;
    const channel = supabase
      .channel("match-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches", filter: `id=eq.${match.id}` },
        () => { fetchMatchData(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [match?.id, fetchMatchData]);

  // Actions
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !match) return;
    await supabase.from("messages").insert([
      { match_id: match.id, sender_id: user.id, content: newMessage.trim() },
    ]);
    setNewMessage("");
    fetchMatchData();
  };

  const handleProposeTrade = async () => {
    if (!selectedPartnerPost) {
      alert("กรุณาเลือกของที่คุณอยากได้จากคู่แลกก่อน");
      return;
    }
    const updateField = user.id === match.user1_id ? "post1_id" : "post2_id";
    await supabase.from("matches").update({ [updateField]: selectedPartnerPost.id }).eq("id", match.id);
    alert("เสนอสิ่งของที่อยากได้เรียบร้อย ✅");
    setDialogOpen(false);
    const { data: updatedMatch } = await supabase.from("matches").select("*").eq("id", match.id).single();
    setMatch(updatedMatch);
  };

  const handleConfirmTrade = async () => {
    if (!match.post1_id || !match.post2_id) {
      alert("❌ ทั้งสองฝ่ายต้องเลือกของก่อน");
      return;
    }
    const { data: exist } = await supabase
      .from("trades")
      .select("*")
      .eq("match_id", match.id)
      .maybeSingle();
    if (exist) { alert("มีการสร้างรายการแลกแล้ว"); return; }
    await supabase.from("trades").insert([{
      match_id: match.id,
      user1_id: match.user1_id,
      user2_id: match.user2_id,
      user1_post_id: match.post1_id,
      user2_post_id: match.post2_id,
      state: "waiting",
    }]);
    alert("📦 เริ่มการแลกเปลี่ยนแล้ว!");
    fetchMatchData();
  };

  const handleAcceptTrade = async () => {
    if (!trade) return;
    const field = user.id === trade.user1_id ? "user1_accept" : "user2_accept";
    const { data: updated } = await supabase
      .from("trades")
      .update({ [field]: true })
      .eq("id", trade.id)
      .select()
      .single();
    if (updated.user1_accept && updated.user2_accept) {
      await supabase.from("trades").update({ state: "accepted" }).eq("id", trade.id);
    }
    alert("✅ ยืนยันการแลกของเรียบร้อย!");
    fetchMatchData();
  };

  const [shippingDialog, setShippingDialog] = useState(false);
  const [shipForm, setShipForm] = useState({ courier: "", tracking: "", image: "", message: "" });

  const handleSubmitShipping = async () => {
    if (!shipForm.courier || !shipForm.tracking || !shipForm.image) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อขนส่ง, เลขแทร็ก, รูปภาพ)");
      return;
    }
    const fileName = `${Date.now()}_${shipForm.image.name}`;
    const { error: uploadError } = await supabase.storage.from("post-images").upload(fileName, shipForm.image);
    if (uploadError) { alert("อัปโหลดรูปไม่สำเร็จ ❌"); return; }
    const { data: publicUrlData } = supabase.storage.from("post-images").getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;

    const prefix = user.id === trade.user1_id ? "user1" : "user2";
    await supabase.from("trades").update({
      [`${prefix}_tracking`]: `${shipForm.courier} - ${shipForm.tracking}`,
      [`${prefix}_item_img`]: imageUrl,
      [`${prefix}_message`]: shipForm.message,
      state: "shipping",
    }).eq("id", trade.id);

    alert("🚚 อัปเดตสถานะการจัดส่งเรียบร้อย!");
    setShippingDialog(false);
    fetchMatchData();
  };

  const handleConfirmReceived = async () => {
    const prefix = user.id === trade.user1_id ? "user1" : "user2";
    const { data: updated } = await supabase
      .from("trades")
      .update({ [`${prefix}_received`]: true })
      .eq("id", trade.id)
      .select()
      .single();
    if (updated.user1_received && updated.user2_received) {
      await supabase.from("trades").update({ state: "completed" }).eq("id", trade.id);
    }
    alert("📦 ยืนยันการได้รับของแล้ว!");
    fetchMatchData();
  };

  // ---------- Render ----------
  // แบบ inline (ฝังในรางขวา)
  if (inline) {
    if (loading) return <div className="chat-loading">กำลังโหลด...</div>;
    if (!match)
      return (
        <div className="chat-inline">
          <div className="partner-card">
            <div className="partner-meta">
              <h2 className="partner-name">ยังไม่มีคู่แมต 😢</h2>
              <p className="partner-email">ไปหน้า “ค้นหา” เพื่อเริ่มปัดเลย</p>
            </div>
          </div>
        </div>
      );

    const bothChosen = match?.post1_id && match?.post2_id;

    return (
      <div className="chat-inline">
        {/* โปรไฟล์คู่แลก */}
        <div className="partner-card">
          <img
            src={partner?.avatar_url || "https://via.placeholder.com/60"}
            alt="avatar"
            className="partner-avatar"
          />
          <div className="partner-meta">
            <h2 className="partner-name">{partner?.full_name}</h2>
            <p className="partner-email">{partner?.email}</p>
          </div>
        </div>

        {/* รายการแลก */}
        <div className="trade-card">
          <h3 className="section-title">📦 รายการแลกเปลี่ยน</h3>
          <p>
            คุณเลือก:{" "}
            <b>
              {user.id === match.user1_id
                ? likedPosts.find((p) => p.id === match.post1_id)?.title || "ยังไม่เลือก"
                : likedPosts.find((p) => p.id === match.post2_id)?.title || "ยังไม่เลือก"}
            </b>
          </p>
          <p>
            คู่แลกเลือก:{" "}
            <b>
              {user.id === match.user1_id
                ? match.post2_title || "รอการเสนอจากคู่แลก"
                : match.post1_title || "รอการเสนอจากคู่แลก"}
            </b>
          </p>

          {!bothChosen ? (
            <button onClick={() => setDialogOpen(true)} className="btn btn--primary mt-12">
              🎁 เลือกของที่จะแลก
            </button>
          ) : !trade ? (
            <button onClick={handleConfirmTrade} className="btn btn--success mt-12">
              📦 ยืนยันการแลกของ
            </button>
          ) : (
            <p className="trade-state">✅ เริ่มการแลกเปลี่ยนแล้ว ({trade.state})</p>
          )}
        </div>

        {/* แชท */}
        <div className="chat-box">
          {trade && trade.state === "waiting" && (
            <button onClick={handleAcceptTrade} className="btn btn--orange mb-8">
              🤝 ยืนยันการแลกของ
            </button>
          )}
          {trade && trade.state === "accepted" && (
            <button onClick={() => setShippingDialog(true)} className="btn btn--purple mb-8">
              🚚 อัปเดตสถานะการจัดส่ง
            </button>
          )}
          {trade && trade.state === "shipping" && (
            <button onClick={handleConfirmReceived} className="btn btn--success mb-8">
              📦 ยืนยันการได้รับของ
            </button>
          )}

          {messages.length === 0 ? (
            <p className="chat-empty">ยังไม่มีข้อความ</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-msg ${msg.sender_id === user.id ? "chat-msg--me" : "chat-msg--other"}`}
              >
                {msg.content}
              </div>
            ))
          )}
        </div>

        {/* input */}
        <div className="chat-inputbar">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="chat-input"
          />
          <button onClick={handleSendMessage} className="btn btn--primary">ส่ง</button>
        </div>

        {/* Dialogs */}
        {dialogOpen && (
          <div className="dialog">
            <div className="dialog__panel">
              <h3 className="dialog__title">🎁 เลือกของจากคู่แลกที่คุณเคยถูกใจ</h3>
              <select
                className="select"
                onChange={(e) =>
                  setSelectedPartnerPost(likedPosts.find((p) => String(p.id) === e.target.value))
                }
              >
                <option value="">-- เลือกของที่อยากได้ --</option>
                {likedPosts.map((post) => (
                  <option key={post.id} value={post.id}>{post.title}</option>
                ))}
              </select>
              <div className="dialog__actions">
                <button onClick={handleProposeTrade} className="btn btn--primary">✅ ยืนยัน</button>
                <button onClick={() => setDialogOpen(false)} className="btn btn--ghost">❌ ยกเลิก</button>
              </div>
            </div>
          </div>
        )}

        {shippingDialog && (
          <div className="dialog">
            <div className="dialog__panel">
              <h3 className="dialog__title">🚚 อัปเดตสถานะการจัดส่ง</h3>
              <input
                type="text"
                placeholder="ชื่อขนส่ง (เช่น Kerry, Flash)"
                className="input"
                value={shipForm.courier}
                onChange={(e) => setShipForm({ ...shipForm, courier: e.target.value })}
              />
              <input
                type="text"
                placeholder="เลขแทร็ก"
                className="input"
                value={shipForm.tracking}
                onChange={(e) => setShipForm({ ...shipForm, tracking: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                className="input"
                onChange={(e) => setShipForm({ ...shipForm, image: e.target.files[0] })}
              />
              <textarea
                placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                className="textarea"
                value={shipForm.message}
                onChange={(e) => setShipForm({ ...shipForm, message: e.target.value })}
              />
              <div className="dialog__actions">
                <button onClick={handleSubmitShipping} className="btn btn--primary">✅ ยืนยันการส่ง</button>
                <button onClick={() => setShippingDialog(false)} className="btn btn--ghost">❌ ยกเลิก</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // แบบเต็มหน้า (ใช้เดิม)
  if (loading) return <div className="chat-loading">กำลังโหลด...</div>;

  if (!match)
    return (
      <div className="chat-page">
        <Navbar onNavigate={onNavigate} />
        <div className="empty-state">
          <h2>ยังไม่มีคู่แมต 😢</h2>
          <p>ไปที่หน้า “ค้นหา” เพื่อเริ่มปัดหาเพื่อนแลกของกันเลย!</p>
        </div>
      </div>
    );

  const bothChosen = match?.post1_id && match?.post2_id;

  return (
    <div className="chat-page">
      <Navbar onNavigate={onNavigate} />
      {/* ... (เนื้อหาเดียวกับเดิมสำหรับโหมดเต็มหน้า) ... */}
    </div>
  );
}
