"use client";
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";

export function CalendarHeader({
  headerText,
  viewMode,
  onViewModeChange,
  onGoToToday,
  onNavigatePrevious,
  onNavigateNext,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold text-white">{headerText}</h2>
        <button
          onClick={onGoToToday}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("month")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === "month"
                ? "bg-gray-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("week")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === "week"
                ? "bg-gray-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onNavigatePrevious}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNavigateNext}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
