"use client";
import {
  Camera,
  Clock,
  Video,
  Images,
  Upload,
  X,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import useUpload from "@/utils/useUpload";

export default function InstagramOptions({
  instagramContentType,
  setInstagramContentType,
  instagramFields,
  setInstagramFields,
  setError,
  mediaItems = [],
}) {
  const [upload] = useUpload();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [collaboratorInput, setCollaboratorInput] = useState("");

  // Auto-select carousel when multiple media items are detected
  useEffect(() => {
    if (mediaItems.length > 1) {
      setInstagramContentType("carousel");
    }
  }, [mediaItems.length, setInstagramContentType]);

  const contentTypes = [
    {
      value: "post",
      label: "Feed Post",
      icon: Camera,
      description: "Share photos and videos in your main feed",
    },
    {
      value: "story",
      label: "Story",
      icon: Clock,
      description: "24-hour disappearing content",
    },
    {
      value: "reel",
      label: "Reel",
      icon: Video,
      description: "Short-form vertical videos",
    },
    {
      value: "carousel",
      label: "Carousel",
      icon: Images,
      description: "Multiple photos/videos in one post",
    },
  ];

  // Check if media items contain mixed types
  const hasImages = mediaItems.some((item) => item.type === "image");
  const hasVideos = mediaItems.some((item) => item.type === "video");
  const hasMixedContent = hasImages && hasVideos;

  const handleThumbnailUpload = async (file) => {
    try {
      setIsUploadingThumbnail(true);
      const { url, error } = await upload({ file });
      if (error) {
        setError(`Failed to upload thumbnail: ${error}`);
        return;
      }
      setInstagramFields((prev) => ({ ...prev, thumbnail: url }));
    } catch (err) {
      console.error("Thumbnail upload error:", err);
      setError("Failed to upload thumbnail");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        handleThumbnailUpload(file);
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
    if (file) handleThumbnailUpload(file);
  };

  const addCollaborator = () => {
    const trimmed = collaboratorInput.trim();
    if (trimmed && !instagramFields.collaborators.includes(trimmed)) {
      if (instagramFields.collaborators.length >= 3) {
        setError("Maximum 3 collaborators allowed for Instagram posts");
        return;
      }
      setInstagramFields((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, trimmed],
      }));
      setCollaboratorInput("");
    }
  };

  const removeCollaborator = (username) => {
    setInstagramFields((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((c) => c !== username),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCollaborator();
    }
  };

  return (
    <div className="mt-6 p-6 bg-gray-700/50 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-4">
        Instagram Content Type
      </h3>

      {/* Carousel Banner Message */}
      {instagramContentType === "carousel" && mediaItems.length > 1 && (
        <div className="mb-6 p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-purple-300 text-sm">
              <strong>Carousel ({mediaItems.length} items):</strong> Max 10
              items (currently: {mediaItems.length})
              {hasMixedContent && (
                <div className="mt-1 text-red-300">
                  <strong>⚠️ Cannot mix images and videos</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-6">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = instagramContentType === type.value;
          const isCarouselForced =
            mediaItems.length > 1 && type.value !== "carousel";

          return (
            <label
              key={type.value}
              className={`relative group cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "scale-[1.02]"
                  : isCarouselForced
                    ? "opacity-50"
                    : "hover:scale-[1.01]"
              }`}
            >
              <input
                type="radio"
                name="instagramContentType"
                value={type.value}
                checked={isSelected}
                onChange={(e) => setInstagramContentType(e.target.value)}
                disabled={isCarouselForced}
                className="sr-only"
              />

              <div
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 min-h-[140px] flex flex-col ${
                  isSelected
                    ? "border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20"
                    : isCarouselForced
                      ? "border-gray-600 bg-gray-800/30 cursor-not-allowed"
                      : "border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50"
                }`}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}

                {/* Disabled indicator */}
                {isCarouselForced && (
                  <div className="absolute inset-0 bg-gray-900/50 rounded-xl flex items-center justify-center">
                    <div className="text-xs text-gray-400 text-center px-2">
                      Multiple media detected
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className="flex items-center justify-center w-8 h-8 mb-3 mx-auto">
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isSelected
                        ? "text-purple-300"
                        : isCarouselForced
                          ? "text-gray-500"
                          : "text-gray-400"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="text-center flex-1 flex flex-col justify-center">
                  <h4
                    className={`font-medium text-sm mb-1 transition-colors ${
                      isSelected
                        ? "text-purple-200"
                        : isCarouselForced
                          ? "text-gray-500"
                          : "text-white"
                    }`}
                  >
                    {type.label}
                  </h4>
                  <p
                    className={`text-xs leading-relaxed transition-colors ${
                      isSelected
                        ? "text-purple-300/80"
                        : isCarouselForced
                          ? "text-gray-500"
                          : "text-gray-400"
                    }`}
                  >
                    {type.description}
                  </p>
                </div>

                {/* Hover effect overlay */}
                {!isCarouselForced && (
                  <div
                    className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 ${
                      isSelected
                        ? "opacity-0"
                        : "opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                    }`}
                  ></div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Instagram Thumbnail - Only show for Reel */}
      {instagramContentType === "reel" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Instagram Thumbnail (Optional)
          </label>
          {!instagramFields.thumbnail ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-purple-400 bg-purple-900/20"
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

              {isUploadingThumbnail ? (
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
                    id="instagram-thumbnail-upload"
                  />
                  <label
                    htmlFor="instagram-thumbnail-upload"
                    className="inline-flex items-center px-6 py-3 border-2 border-purple-500 hover:border-purple-400 text-purple-400 hover:text-purple-300 rounded-lg cursor-pointer transition-colors font-medium"
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
                src={instagramFields.thumbnail}
                alt="Instagram thumbnail"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() =>
                  setInstagramFields((prev) => ({ ...prev, thumbnail: null }))
                }
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove thumbnail
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Custom thumbnail for your Instagram Reel. Will be used as the Reel
            cover.
          </p>
        </div>
      )}

      {/* Instagram Collaborators - Hidden for stories */}
      {instagramContentType !== "story" && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Instagram Collaborators (Optional)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={collaboratorInput}
              onChange={(e) => setCollaboratorInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Instagram username"
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              disabled={instagramFields.collaborators.length >= 3}
            />
            <button
              type="button"
              onClick={addCollaborator}
              disabled={
                !collaboratorInput.trim() ||
                instagramFields.collaborators.length >= 3
              }
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>

          {instagramFields.collaborators.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {instagramFields.collaborators.map((collaborator, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-300 text-sm"
                >
                  @{collaborator}
                  <button
                    type="button"
                    onClick={() => removeCollaborator(collaborator)}
                    className="text-purple-300 hover:text-purple-200 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400">
            Add Instagram usernames to collaborate on this post. They will
            receive an invitation to collaborate. Maximum 3 collaborators
            allowed.
          </p>
        </div>
      )}
    </div>
  );
}
