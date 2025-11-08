import React, { useState } from "react";
import { supabase } from "../userauth/supabase";
import { Z_GREEN } from "../constants";


export default function EditPostModal({ post, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: post.title,
    category: post.category,
    location: post.location || '',
    detail: post.detail || '',
    images: post.images || []
  });
  const [loading, setLoading] = useState(false);

  const categories = ["ทั่วไป", "อุปกรณ์อิเล็กทรอนิกส์", "หนังสือ", "แฟชั่น", "ของแต่งบ้าน", "กีฬา", "เครื่องใช้ไฟฟ้า", "ของสะสม"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          category: formData.category,
          location: formData.location,
          detail: formData.detail,
          images: formData.images,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;
      alert('แก้ไขโพสต์สำเร็จ');
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">แก้ไขโพสต์</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อสิ่งของ</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">จังหวัด</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">รายละเอียด</label>
            <textarea
              value={formData.detail}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows="4"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md"
              style={{ background: Z_GREEN }}
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
