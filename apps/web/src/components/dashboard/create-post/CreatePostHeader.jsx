"use client";
import { ArrowLeft } from "lucide-react";

export default function CreatePostHeader({ profileId, isEdit = false }) {
  const handleBackClick = () => {
    window.location.href = `/dashboard?profile=${profileId}&tab=posts`;
  };

  return (
    <div className="mb-8">
      <button
        onClick={handleBackClick}
        className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Posts
      </button>
      <h1 className="text-3xl font-bold text-white">
        {isEdit ? "Edit Post" : "Create New Post"}
      </h1>
      <p className="text-gray-400 mt-2">
        {isEdit
          ? "Make changes to your scheduled or draft post"
          : "Schedule content across your social media platforms"}
      </p>
    </div>
  );
}
