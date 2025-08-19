"use client";

import { Calendar, FileText } from "lucide-react";
import PostCard from "./PostCard";

const LoadingState = () => (
  <div className="text-center py-16">
    <div className="flex flex-col items-center">
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-0"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-75"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-150"></div>
      </div>
      <p className="text-gray-400 text-sm mt-3">Loading posts...</p>

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
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
    <p className="text-red-400">{error}</p>
    <button
      onClick={onRetry}
      className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
    >
      Try Again
    </button>
  </div>
);

const EmptyState = ({ filters, onClearFilters }) => {
  const isFiltered =
    filters.status !== "all" ||
    filters.platform !== "all" ||
    filters.dateFilter !== "all";
  return (
    <div className="text-center py-16">
      <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
      <p className="text-gray-400 mb-4">
        {isFiltered
          ? "No posts match your current filters"
          : "You haven't created any posts yet"}
      </p>
      {isFiltered && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

const CalendarView = () => (
  <div className="text-center py-16">
    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">
      Calendar View Coming Soon
    </h3>
    <p className="text-gray-400">
      View your posting schedule in calendar format
    </p>
  </div>
);

const PostsList = ({
  posts,
  pagination,
  setPagination,
  onEditPost,
  onDeletePost,
  userTimezone,
}) => (
  <div className="space-y-4">
    {posts.map((post) => (
      <PostCard
        key={post.id}
        post={post}
        onEdit={onEditPost}
        onDelete={onDeletePost}
        userTimezone={userTimezone}
      />
    ))}

    {pagination.total > pagination.limit && (
      <div className="flex justify-center items-center gap-4 pt-6">
        <button
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              page: Math.max(1, prev.page - 1),
            }))
          }
          disabled={pagination.page <= 1}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Previous
        </button>
        <span className="text-gray-400">
          Page {pagination.page} of{" "}
          {Math.ceil(pagination.total / pagination.limit)}
        </span>
        <button
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              page: prev.page + 1,
            }))
          }
          disabled={
            pagination.page >= Math.ceil(pagination.total / pagination.limit)
          }
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Next
        </button>
      </div>
    )}
  </div>
);

export default function PostsContent({
  viewMode,
  loading,
  error,
  posts,
  filters,
  pagination,
  fetchPosts,
  clearFilters,
  setPagination,
  onEditPost,
  onDeletePost,
  userTimezone,
}) {
  if (viewMode === "calendar") {
    return <CalendarView />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchPosts} />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (posts.length === 0) {
    return <EmptyState filters={filters} onClearFilters={clearFilters} />;
  }

  return (
    <PostsList
      posts={posts}
      pagination={pagination}
      setPagination={setPagination}
      onEditPost={onEditPost}
      onDeletePost={onDeletePost}
      userTimezone={userTimezone}
    />
  );
}
