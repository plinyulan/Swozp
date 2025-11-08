import React from 'react';

export default function PostCard({ post, onView, showActions, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.images?.[0] && (
        <img 
          src={post.images[0]} 
          alt={post.title} 
          className="w-full h-48 object-cover cursor-pointer"
          onClick={onView}
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 
              className="text-lg font-bold text-gray-900 cursor-pointer hover:underline" 
              onClick={onView}
            >
              {post.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {post.category} • {post.location || 'ไม่ระบุ'}
            </p>
          </div>
          {post.profiles && (
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.full_name}
              className="w-10 h-10 rounded-full ml-3"
            />
          )}
        </div>
        <p className="mt-3 text-sm text-gray-700 line-clamp-2">
          {post.detail}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString('th-TH')}
          </span>
          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="text-sm px-3 py-1 border rounded-md hover:bg-gray-50"
              >
                แก้ไข
              </button>
              <button
                onClick={onDelete}
                className="text-sm px-3 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
              >
                ลบ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}