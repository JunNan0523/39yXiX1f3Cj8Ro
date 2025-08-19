"use client";
import { Calendar } from "lucide-react";
import usePosts from "@/hooks/usePosts";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useCalendarInteractions } from "@/hooks/useCalendarInteractions";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { MonthView } from "./calendar/MonthView";
import { WeeklyTimeBlockView } from "./calendar/WeeklyTimeBlockView";
import { CalendarLegend } from "./calendar/CalendarLegend";

function NoProfileSelected() {
  return (
    <div className="text-center py-16">
      <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        Select a Profile
      </h3>
      <p className="text-gray-400">
        Choose a profile to view your content calendar
      </p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-8">
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-0"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-75"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-150"></div>
      </div>

      <style jsx global>{`
        .animation-delay-0 {
          animation-delay: 0ms;
        }
        .animation-delay-75 {
          animation-delay: 200ms;
        }
        .animation-delay-150 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}

function ErrorDisplay({ error }) {
  return (
    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
      <p className="text-red-400">{error}</p>
    </div>
  );
}

export default function CalendarTab({ selectedProfile }) {
  const {
    currentDate,
    viewMode,
    setViewMode,
    dateRange,
    headerText,
    navigatePrevious,
    navigateNext,
    goToToday,
  } = useCalendarState();

  const postData = usePosts(selectedProfile, {
    calendarMode: true,
    dateRange: { start: dateRange.start, end: dateRange.end },
  });

  const {
    draggedPost,
    dragPreview,
    updatingPosts,
    postsByDate,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    handleCreatePost,
  } = useCalendarInteractions(selectedProfile, postData);

  if (!selectedProfile) {
    return <NoProfileSelected />;
  }

  // Show loading state when data is being fetched
  if (postData.loading) {
    return (
      <div className="space-y-4">
        <CalendarHeader
          headerText={headerText}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onGoToToday={goToToday}
          onNavigatePrevious={navigatePrevious}
          onNavigateNext={navigateNext}
        />
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state if there's an error
  if (postData.error) {
    return (
      <div className="space-y-4">
        <CalendarHeader
          headerText={headerText}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onGoToToday={goToToday}
          onNavigatePrevious={navigatePrevious}
          onNavigateNext={navigateNext}
        />
        <ErrorDisplay error={postData.error} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CalendarHeader
        headerText={headerText}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onGoToToday={goToToday}
        onNavigatePrevious={navigatePrevious}
        onNavigateNext={navigateNext}
      />

      {viewMode === "week" ? (
        <WeeklyTimeBlockView
          dateRange={dateRange}
          postsByDate={postsByDate}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onCreatePost={handleCreatePost}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          draggedPost={draggedPost}
          updatingPosts={updatingPosts}
        />
      ) : (
        <MonthView
          dateRange={dateRange}
          currentDate={currentDate}
          postsByDate={postsByDate}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleCreatePost={handleCreatePost}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          draggedPost={draggedPost}
          dragPreview={dragPreview}
          updatingPosts={updatingPosts}
        />
      )}

      <CalendarLegend viewMode={viewMode} />
    </div>
  );
}
