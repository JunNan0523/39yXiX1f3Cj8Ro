"use client";

export default function PostsToolbar({ filters, onFilterChange }) {
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-end">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="px-4 py-2 bg-gray-700/60 backdrop-blur-sm border border-gray-600/30 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all min-w-[120px] appearance-none bg-no-repeat bg-right"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 12px center",
              backgroundSize: "16px 16px",
              paddingRight: "40px",
            }}
          >
            <option value="all">All posts</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>

          {/* Platform Filter */}
          <select
            value={filters.platform}
            onChange={(e) => onFilterChange("platform", e.target.value)}
            className="px-4 py-2 bg-gray-700/60 backdrop-blur-sm border border-gray-600/30 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all min-w-[140px] appearance-none bg-no-repeat bg-right"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 12px center",
              backgroundSize: "16px 16px",
              paddingRight: "40px",
            }}
          >
            <option value="all">All platforms</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter</option>
            <option value="threads">Threads</option>
          </select>

          {/* Date Filter */}
          <select
            value={filters.dateFilter}
            onChange={(e) => onFilterChange("dateFilter", e.target.value)}
            className="px-4 py-2 bg-gray-700/60 backdrop-blur-sm border border-gray-600/30 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all min-w-[120px] appearance-none bg-no-repeat bg-right"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 12px center",
              backgroundSize: "16px 16px",
              paddingRight: "40px",
            }}
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="thisweek">This week</option>
            <option value="nextweek">Next week</option>
            <option value="thismonth">This month</option>
            <option value="lastmonth">Last month</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
      </div>
      {filters.dateFilter === "custom" && (
        <div className="flex gap-3 mt-4">
          <input
            type="date"
            value={filters.customStartDate}
            onChange={(e) => onFilterChange("customStartDate", e.target.value)}
            className="px-4 py-2 bg-gray-700/60 backdrop-blur-sm border border-gray-600/30 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
          <span className="text-gray-400 self-center">to</span>
          <input
            type="date"
            value={filters.customEndDate}
            onChange={(e) => onFilterChange("customEndDate", e.target.value)}
            className="px-4 py-2 bg-gray-700/60 backdrop-blur-sm border border-gray-600/30 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
      )}
    </div>
  );
}
