"use client";
import { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { format, startOfDay, setHours, setMinutes, isToday } from "date-fns";
import { PostCard } from "./PostCard";
import { DragPreview } from "./DragPreview";

export function WeeklyTimeBlockView({
  dateRange,
  postsByDate,
  onDrop,
  onDragOver,
  onDragLeave,
  onCreatePost,
  onDragStart,
  onDragEnd,
  draggedPost,
  updatingPosts,
}) {
  const [dragPreview, setDragPreview] = useState(null);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push({
          hour,
          minute,
          timeString: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        });
      }
    }
    return slots;
  }, []);

  const getPostsForTimeSlot = (day, timeSlot) => {
    const dayKey = format(day, "yyyy-MM-dd");
    const dayPosts = postsByDate[dayKey] || [];

    return dayPosts.filter((post) => {
      if (!post.scheduledFor) return false;
      const postTime = new Date(post.scheduledFor);
      const postHour = postTime.getHours();
      const postMinute = postTime.getMinutes();
      return (
        postHour === timeSlot.hour &&
        postMinute >= timeSlot.minute &&
        postMinute < timeSlot.minute + 30
      );
    });
  };

  const getTimeFromDragPosition = useCallback(
    (e, timeSlotElement, day, timeSlot) => {
      const rect = timeSlotElement.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const slotHeight = rect.height;
      const minuteOffset = Math.floor((relativeY / slotHeight) * 30);
      const finalMinute = Math.min(
        timeSlot.minute + minuteOffset,
        timeSlot.minute + 29,
      );
      return setMinutes(setHours(startOfDay(day), timeSlot.hour), finalMinute);
    },
    [],
  );

  const handleDragOver = (e, day, timeSlot, element) => {
    e.preventDefault();
    if (draggedPost && day && timeSlot) {
      const preciseDateTime = getTimeFromDragPosition(
        e,
        element,
        day,
        timeSlot,
      );
      setDragPreview({
        post: draggedPost,
        targetDay: day,
        targetTime: preciseDateTime,
        timeSlot,
      });
      onDragOver && onDragOver(e, day, preciseDateTime);
    }
  };

  const handleDrop = (e, day, timeSlot, element) => {
    e.preventDefault();
    const preciseDateTime = getTimeFromDragPosition(e, element, day, timeSlot);
    setDragPreview(null);
    onDrop && onDrop(e, day, preciseDateTime);
  };

  const handleDragLeave = (e) => {
    onDragLeave(e);
    setDragPreview(null);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg overflow-hidden">
      <div className="flex">
        {/* Time column */}
        <div className="w-20 bg-gray-900/50 border-r border-gray-700/30 flex-shrink-0">
          {/* Header */}
          <div className="h-16 border-b border-gray-700/30 flex items-center justify-center">
            <span className="text-xs text-gray-400 font-medium">Time</span>
          </div>
          {/* Time slots */}
          {timeSlots.map((slot) => {
            const isHourStart = slot.minute === 0;
            return (
              <div
                key={`${slot.hour}-${slot.minute}`}
                className={`h-28 flex items-center justify-center ${
                  isHourStart ? "border-b border-gray-600/40" : ""
                }`}
              >
                {isHourStart && (
                  <span className="text-xs text-gray-300 font-medium">
                    {slot.timeString}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Days header */}
          <div className="grid grid-cols-7 bg-gray-900/50 h-16">
            {dateRange.days.map((day) => {
              const isTodayDate = isToday(day);
              return (
                <div
                  key={format(day, "yyyy-MM-dd")}
                  className={`flex flex-col items-center justify-center border-r border-gray-700/30 last:border-r-0 ${
                    isTodayDate ? "bg-blue-900/15 border-blue-600/30" : ""
                  }`}
                >
                  <div
                    className={`text-sm font-medium ${
                      isTodayDate ? "text-blue-300 font-semibold" : "text-white"
                    }`}
                  >
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isTodayDate
                        ? "text-blue-300 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {format(day, "MMM d")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="relative">
            {timeSlots.map((timeSlot) => {
              const isHourStart = timeSlot.minute === 0;
              return (
                <div
                  key={`${timeSlot.hour}-${timeSlot.minute}`}
                  className="grid grid-cols-7"
                >
                  {dateRange.days.map((day) => {
                    const posts = getPostsForTimeSlot(day, timeSlot);
                    const isTodayDate = isToday(day);

                    return (
                      <div
                        key={`${format(day, "yyyy-MM-dd")}-${timeSlot.timeString}`}
                        className={`h-28 border-r border-gray-700/20 last:border-r-0 p-1 relative hover:bg-gray-700/20 transition-colors group ${
                          isHourStart ? "border-b border-gray-600/40" : ""
                        } ${isTodayDate ? "bg-blue-900/8 border-blue-600/15" : ""}`}
                        style={{
                          overflow: "visible",
                          zIndex: posts.length > 0 ? 10 : 1,
                        }}
                        onDragOver={(e) =>
                          handleDragOver(e, day, timeSlot, e.currentTarget)
                        }
                        onDragLeave={handleDragLeave}
                        onDrop={(e) =>
                          handleDrop(e, day, timeSlot, e.currentTarget)
                        }
                        onClick={() => {
                          const defaultDateTime = setMinutes(
                            setHours(startOfDay(day), timeSlot.hour),
                            timeSlot.minute,
                          );
                          onCreatePost(defaultDateTime);
                        }}
                      >
                        {/* Add button */}
                        <button className="absolute top-1 right-1 w-4 h-4 bg-blue-600 hover:bg-blue-700 rounded-full items-center justify-center transition-all opacity-0 group-hover:opacity-90 hidden group-hover:flex z-20">
                          <Plus className="w-2 h-2 text-white" />
                        </button>

                        {/* Posts container with proper overflow */}
                        <div
                          className="h-full relative"
                          style={{ overflow: "visible" }}
                        >
                          {posts.map((post, index) => (
                            <div
                              key={post._id || post.id}
                              className="mb-1 relative"
                              style={{ zIndex: 10 + index }}
                            >
                              <PostCard
                                post={post}
                                isDragging={
                                  draggedPost?._id === post._id ||
                                  draggedPost?.id === post.id
                                }
                                isUpdating={updatingPosts.has(
                                  post._id || post.id,
                                )}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Drag preview with real-time time display */}
                        {dragPreview &&
                          dragPreview.targetDay &&
                          dragPreview.timeSlot &&
                          format(dragPreview.targetDay, "yyyy-MM-dd") ===
                            format(day, "yyyy-MM-dd") &&
                          dragPreview.timeSlot.hour === timeSlot.hour &&
                          dragPreview.timeSlot.minute === timeSlot.minute && (
                            <div className="absolute inset-1 pointer-events-none z-30">
                              <div className="absolute inset-0 bg-blue-600/20 border-2 border-blue-400/60 rounded-md backdrop-blur-sm"></div>
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                                  {format(dragPreview.targetTime, "HH:mm")}
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
