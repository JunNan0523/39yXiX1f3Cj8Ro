"use client";

import {
  canEditPost,
  canDeletePost,
  truncateContent,
  getStatusBadgeColor,
  getStatusText,
  getPlatformStatusStyle,
  getPlatformIcon,
  getStatusIcon,
  formatDate,
} from "./postsUtils";

export default function PostCard({ post, onEdit, onDelete, userTimezone }) {
  const hasMedia =
    post.mediaItems && post.mediaItems.length > 0 && post.mediaItems[0].url;

  return (
    <div className="bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-colors overflow-hidden">
      <div className="flex h-48">
        {/* Left side - Media Thumbnail */}
        {hasMedia && (
          <div className="w-48 flex-shrink-0">
            {post.mediaItems[0].type === "video" ? (
              <video
                src={post.mediaItems[0].url}
                className="w-full h-full object-cover"
                muted
              />
            ) : (
              <img
                src={post.mediaItems[0].url}
                alt="Post thumbnail"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {/* Right side - Content Details */}
        <div className="flex-1 p-6 flex flex-col min-w-0">
          {/* Top section with content and status badge */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4 min-w-0">
              <p className="text-white text-sm leading-relaxed line-clamp-4">
                {truncateContent(post.content)}
              </p>
            </div>
            <span
              className={`inline-block px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusBadgeColor(
                post.status,
              )}`}
            >
              {getStatusText(post.status)}
            </span>
          </div>

          {/* Date information */}
          <div className="text-xs text-gray-400 mb-4">
            {post.scheduledFor && (
              <>
                {post.status?.toLowerCase() === "draft"
                  ? "Saved as draft"
                  : post.status?.toLowerCase() === "published"
                    ? `Published: ${formatDate(post.scheduledFor, userTimezone)}`
                    : post.status?.toLowerCase() === "scheduled"
                      ? `Scheduled: ${formatDate(post.scheduledFor, userTimezone)}`
                      : formatDate(post.scheduledFor, userTimezone)}
                {formatDate(post.createdAt, userTimezone) && " | "}
              </>
            )}
            {formatDate(post.createdAt, userTimezone) &&
              `Created: ${formatDate(post.createdAt, userTimezone)}`}
          </div>

          {/* Platforms */}
          <div className="mb-4 flex-1">
            <div className="flex flex-wrap gap-2">
              {post.platforms &&
                post.platforms.map((platformObj, index) => (
                  <span
                    key={index}
                    className={`flex items-center gap-2 px-3 py-1 text-xs rounded-lg ${getPlatformStatusStyle(
                      platformObj.status,
                    )}`}
                  >
                    {getPlatformIcon(platformObj.platform)}
                    <span className="capitalize">{platformObj.platform}</span>
                    {getStatusIcon(platformObj.status)}
                  </span>
                ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            {canEditPost(post) && (
              <button
                onClick={() => onEdit(post)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 backdrop-blur-sm text-xs rounded transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 2 4 4-12 12H6v-4z" />
                  <path d="m21.5 5.5-3.5-3.5" />
                </svg>
                Edit
              </button>
            )}
            {canDeletePost(post) && (
              <button
                onClick={() => onDelete(post)}
                className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 backdrop-blur-sm text-xs rounded transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
