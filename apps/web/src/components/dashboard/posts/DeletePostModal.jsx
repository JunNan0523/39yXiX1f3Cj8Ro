"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { truncateContent } from "./postsUtils";

export default function DeletePostModal({
  show,
  postContent,
  onCancel,
  onConfirm,
  isLoading,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!show || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Delete Post</h3>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete this post? This action cannot be
          undone.
        </p>
        {postContent && (
          <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-300 italic">
              "{truncateContent(postContent, 100)}"
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                Deleting...
              </>
            ) : (
              "Delete Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
