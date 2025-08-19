"use client";
import { Upload, AlertCircle } from "lucide-react";
import { useState } from "react";
import useUpload from "@/utils/useUpload";

export default function YouTubeOptions({
  youtubeFields,
  setYoutubeFields,
  setError,
  globalContent,
}) {
  const [upload] = useUpload();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleYoutubeThumbnailUpload = async (file) => {
    try {
      setIsUploading(true);
      const { url, error } = await upload({ file });
      if (error) {
        setError(`Failed to upload thumbnail: ${error}`);
        return;
      }
      setYoutubeFields((prev) => ({ ...prev, thumbnail: url }));
    } catch (err) {
      console.error("Thumbnail upload error:", err);
      setError("Failed to upload thumbnail");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        handleYoutubeThumbnailUpload(file);
      } else {
        setError("Please select an image file for thumbnail");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleYoutubeThumbnailUpload(file);
  };

  return (
    <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-blue-300 text-sm">
            <strong>YouTube Auto-Detection:</strong> Videos ≤ 3 minutes will
            automatically be detected as YouTube Shorts. Videos longer than 3
            minutes will be regular YouTube videos.
          </div>
        </div>
      </div>
      <h3 className="text-lg font-medium text-white mb-4">YouTube Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube Title (Optional)
          </label>
          <input
            type="text"
            value={youtubeFields.title}
            onChange={(e) =>
              setYoutubeFields((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Custom title for your YouTube video. If not provided, the global content will be used."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Custom title for this YouTube video. Leave empty to use the main
            post content as the title.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube Description
          </label>
          <div className="text-gray-300 py-2">
            {globalContent ||
              "Your main content will appear here as the YouTube description."}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            This will use your main post content as the YouTube description.
            This cannot be changed separately.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube Tags (Optional)
          </label>
          <input
            type="text"
            value={youtubeFields.tags}
            onChange={(e) =>
              setYoutubeFields((prev) => ({ ...prev, tags: e.target.value }))
            }
            placeholder="programming, tutorial, javascript (comma-separated)"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Keywords to help people discover your video. YouTube uses these for
            search and recommendations.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube Thumbnail (Optional)
          </label>
          {!youtubeFields.thumbnail ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-blue-400 bg-blue-900/20"
                  : "border-gray-600 bg-gray-800/30"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white text-lg font-medium mb-2">
                Drag and drop your thumbnail
              </p>
              <p className="text-gray-400 mb-4">or click to select files</p>

              {isUploading ? (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Upload className="w-4 h-4" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="youtube-thumbnail-upload"
                  />
                  <label
                    htmlFor="youtube-thumbnail-upload"
                    className="inline-flex items-center px-6 py-3 border-2 border-blue-500 hover:border-blue-400 text-blue-400 hover:text-blue-300 rounded-lg cursor-pointer transition-colors font-medium"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Media
                  </label>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <img
                src={youtubeFields.thumbnail}
                alt="YouTube thumbnail"
                className="w-32 h-18 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() =>
                  setYoutubeFields((prev) => ({ ...prev, thumbnail: null }))
                }
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove thumbnail
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Custom thumbnail image. Recommended: 1280x720 pixels, JPG/PNG
            format, max 2MB.
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">
              Add first comment
            </span>
            <button
              type="button"
              onClick={() =>
                setYoutubeFields((prev) => ({
                  ...prev,
                  includeFirstComment: !prev.includeFirstComment,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                youtubeFields.includeFirstComment
                  ? "bg-blue-600"
                  : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  youtubeFields.includeFirstComment
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {youtubeFields.includeFirstComment && (
            <textarea
              value={youtubeFields.firstComment}
              onChange={(e) =>
                setYoutubeFields((prev) => ({
                  ...prev,
                  firstComment: e.target.value,
                }))
              }
              placeholder="Thanks for watching! Don't forget to like and subscribe!"
              className="w-full h-20 px-3 py-2 mt-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10000}
            />
          )}
          {youtubeFields.includeFirstComment && (
            <p className="text-xs text-gray-400 mt-1">
              Automatically post this comment on your video to engage with
              viewers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
