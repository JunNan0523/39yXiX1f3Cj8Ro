"use client";
import { format, isSameMonth, isToday } from "date-fns";
import { DayCell } from "./DayCell";

export function MonthView({
  dateRange,
  currentDate,
  postsByDate,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleCreatePost,
  handleDragStart,
  handleDragEnd,
  draggedPost,
  dragPreview,
  updatingPosts,
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-900/50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-300 border-b border-gray-700/30"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6">
        {dateRange.days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayPosts = postsByDate[dayKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <DayCell
              key={dayKey}
              day={day}
              posts={dayPosts}
              isCurrentMonth={isCurrentMonth}
              isToday={isTodayDate}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onCreatePost={handleCreatePost}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              draggedPost={draggedPost}
              dragPreview={dragPreview}
              updatingPosts={updatingPosts}
            />
          );
        })}
      </div>
    </div>
  );
}
