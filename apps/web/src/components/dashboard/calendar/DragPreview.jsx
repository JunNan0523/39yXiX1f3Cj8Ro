"use client";
import { format } from "date-fns";

export function DragPreview({ post, targetDay, targetTime, isVisible }) {
  if (!isVisible || !post) return null;

  const statusColor =
    post.status === "published" ? "bg-green-500" : "bg-blue-500";
  const platformCount = post.platforms ? Object.keys(post.platforms).length : 0;

  return (
    <div className="bg-blue-600/30 border border-blue-400/50 rounded-lg p-2 mb-2 text-xs opacity-70 scale-90 transform transition-all">
      <div className="flex items-start justify-between mb-1">
        <div
          className={`w-2 h-2 ${statusColor} rounded-full flex-shrink-0 mt-1`}
        ></div>
        <span className="text-gray-300 text-[10px] ml-auto">
          {platformCount} platform{platformCount !== 1 ? "s" : ""}
        </span>
      </div>
      <p className="text-gray-200 text-xs line-clamp-2 leading-tight">
        {post.content || "No content"}
      </p>
      {/* Show precise time during drag for weekly view */}
      <p className="text-blue-300 text-[10px] mt-1 font-medium">
        {targetTime ? format(targetTime, "HH:mm") : format(targetDay, "MMM d")}
      </p>
    </div>
  );
}
