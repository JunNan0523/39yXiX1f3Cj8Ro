"use client";

export function CalendarLegend({ viewMode }) {
  return (
    <div className="flex items-center justify-center space-x-6 text-sm">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-gray-300">Scheduled</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-gray-300">Published</span>
      </div>
    </div>
  );
}
