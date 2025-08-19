"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { PostCard } from "./PostCard";
import { DragPreview } from "./DragPreview";

export function DayCell({
  day,
  posts,
  isCurrentMonth,
  isToday,
  onDrop,
  onDragOver,
  onDragLeave,
  onCreatePost,
  onDragStart,
  onDragEnd,
  draggedPost,
  dragPreview,
  updatingPosts,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver && onDragOver(e, day);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onDragLeave && onDragLeave(e);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop && onDrop(e, day);
  };

  return (
    <div
      className={`
        min-h-16 border border-gray-700/30 p-2 relative overflow-hidden
        ${isCurrentMonth ? "bg-gray-800/20" : "bg-gray-900/20"}
        ${isToday ? "bg-blue-900/15 border-blue-600/30 ring-1 ring-blue-600/20" : ""}
        ${isDragOver ? "bg-blue-900/30 border-blue-500/50 ring-1 ring-blue-500/30" : ""}
        transition-all duration-200 flex flex-col
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-start mb-1">
        <span
          className={`text-sm font-medium ${
            isToday
              ? "text-blue-300 font-semibold"
              : isCurrentMonth
                ? "text-white"
                : "text-gray-500"
          }`}
        >
          {format(day, "d")}
        </span>
        {isHovered && !isDragOver && (
          <button
            onClick={() => onCreatePost(day)}
            className="w-5 h-5 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all opacity-90 hover:opacity-100"
          >
            <Plus className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
      <div className="space-y-1 flex-1 overflow-y-auto">
        {posts.map((post) => (
          <PostCard
            key={post._id || post.id}
            post={post}
            isDragging={
              draggedPost &&
              (draggedPost._id || draggedPost.id) === (post._id || post.id)
            }
            isUpdating={updatingPosts.has(post._id || post.id)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {dragPreview &&
          dragPreview.targetDay &&
          format(dragPreview.targetDay, "yyyy-MM-dd") ===
            format(day, "yyyy-MM-dd") && (
            <DragPreview
              post={dragPreview.post}
              targetDay={dragPreview.targetDay}
              isVisible={true}
            />
          )}
      </div>
    </div>
  );
}
