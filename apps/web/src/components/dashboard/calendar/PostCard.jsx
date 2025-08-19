"use client";
import { format } from "date-fns";

export function PostCard({ post, isDragging, isUpdating, onDragStart, onDragEnd }) {
  const statusColor =
    post.status === "published" ? "bg-green-500" : "bg-blue-500";
  const platformCount = post.platforms ? Object.keys(post.platforms).length : 0;
  const isPublished = post.status === "published";
  const isLocked = isPublished; // Published posts are locked

  return (
    <div
      draggable={!isLocked}
      onDragStart={(e) => {
        if (isLocked) {
          e.preventDefault();
          return;
        }
        onDragStart(e, post);
      }}
      onDragEnd={onDragEnd}
      className={`
        bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-lg p-2 mb-2 
        transition-all duration-200 text-xs relative
        ${!isLocked ? "cursor-move" : "cursor-not-allowed opacity-75"}
        ${isDragging ? "opacity-30 scale-95 rotate-3" : "opacity-100 scale-100"}
        ${isUpdating ? "opacity-50" : ""}
      `}
      title={
        isLocked
          ? "Published posts cannot be rescheduled"
          : "Drag to reschedule"
      }
    >
      <div className="flex items-start justify-between mb-1">
        <div
          className={`w-2 h-2 ${statusColor} rounded-full flex-shrink-0 mt-1`}
        ></div>
        <div className="flex items-center space-x-1">
          <span className="text-gray-400 text-[10px]">
            {platformCount} platform{platformCount !== 1 ? "s" : ""}
          </span>
          {isLocked && (
            <svg
              className="w-2 h-2 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
      <p className="text-white text-xs line-clamp-2 leading-tight">
        {post.content || "No content"}
      </p>
      {post.scheduledFor && (
        <p className="text-gray-400 text-[10px] mt-1">
          {format(new Date(post.scheduledFor), "HH:mm")}
        </p>
      )}
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm rounded-lg">
          <div className="w-3 h-3 border border-gray-400 border-t-blue-400 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
