"use client";
import { Plus } from "lucide-react";

export default function PostsHeader({ selectedProfileId }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Posts</h3>
        <p className="text-gray-400">
          Manage your scheduled and published content
        </p>
      </div>
      <button
        onClick={() =>
          (window.location.href = `/dashboard/profiles/${selectedProfileId}/create-post`)
        }
        className="flex items-center px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 backdrop-blur-sm font-medium rounded-lg transition-all duration-200"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Post
      </button>
    </div>
  );
}
