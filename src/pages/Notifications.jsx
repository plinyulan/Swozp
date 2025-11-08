import React, { useState, useEffect } from "react";
/*import Navbar from "../components/Navbar";*/
import { useAuth } from "../context/AuthContext";
import { supabase } from "../userauth/supabase";
import { Z_GREEN } from "../constants";
import LeftRail from "../components/LeftRail";


export default function Notifications({ onNavigate }) {
  const { user } = useAuth();
  const [pendingMatches, setPendingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPendingMatches();
  }, [user]);

  const fetchPendingMatches = async () => {
    setLoading(true);
    try {
      // ดึงคนที่สนใจโพสต์ของเรา (status = pending)
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          post:posts(*),
          user:profiles!matches_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('post_owner_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingMatches(data || []);
    } catch (error) {
      console.error('Error fetching pending matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'accepted' })
        .eq('id', matchId);

      if (error) throw error;
      alert('✅ ยอมรับแล้ว! สามารถแชทได้ในหน้าแชท');
      fetchPendingMatches();
    } catch (error) {
      console.error('Error accepting match:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleReject = async (matchId) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'rejected' })
        .eq('id', matchId);

      if (error) throw error;
      alert('❌ ปฏิเสธแล้ว');
      fetchPendingMatches();
    } catch (error) {
      console.error('Error rejecting match:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  if (!user) {
    return (
      <div>
        <LeftRail onNavigate={onNavigate} user={user} />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h2>
          <button onClick={() => onNavigate('login')} className="px-6 py-2 rounded-md text-white" style={{ background: Z_GREEN }}>
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LeftRail onNavigate={onNavigate} user={user} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">การแจ้งเตือน</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-500">กำลังโหลด...</div>
        ) : pendingMatches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500 mb-4">ไม่มีการแจ้งเตือน</div>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-2 text-white rounded-md"
              style={{ background: Z_GREEN }}
            >
              กลับหน้าหลัก
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <img
                    src={match.user?.avatar_url || '/default-avatar.png'}
                    alt={match.user?.full_name}
                    className="w-16 h-16 rounded-full"
                  />

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">{match.user?.full_name}</span>
                      <span className="text-gray-500 text-sm">สนใจโพสต์ของคุณ</span>
                    </div>

                    {match.post && (
                      <div className="bg-gray-50 p-3 rounded-md mb-3">
                        <div className="flex gap-3">
                          {match.post.images?.[0] && (
                            <img
                              src={match.post.images[0]}
                              alt={match.post.title}
                              className="w-20 h-20 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{match.post.title}</div>
                            <div className="text-sm text-gray-500">{match.post.category}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mb-3">
                      {new Date(match.created_at).toLocaleString('th-TH')}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAccept(match.id)}
                        className="px-6 py-2 rounded-md text-white"
                        style={{ background: Z_GREEN }}
                      >
                        ยอมรับ
                      </button>
                      <button
                        onClick={() => handleReject(match.id)}
                        className="px-6 py-2 rounded-md border border-red-500 text-red-500 hover:bg-red-50"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
