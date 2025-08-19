"use client";
import { useRef, useState, useEffect } from "react";
import { Upload, Image, Video, X } from "lucide-react";
import useUpload from "@/utils/useUpload";

function MediaPreview({ mediaItems, onRemove }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      {mediaItems.map((media, index) => (
        <div key={index} className="relative group">
          {media.type === "image" ? (
            <img
              src={media.url}
              alt="Upload preview"
              className="w-full max-h-80 object-contain rounded-lg bg-gray-900/50"
            />
          ) : (
            <video
              src={media.url}
              className="w-full max-h-80 object-contain rounded-lg bg-gray-900/50"
              controls
              preload="metadata"
              muted
              onLoadStart={(e) => {
                // Set poster frame to first frame
                e.target.currentTime = 0.1;
              }}
            />
          )}

          {/* File name label at top */}
          {media.filename && (
            <div className="absolute top-2 left-2 right-8 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1">
              <p className="text-white text-xs font-medium truncate">
                {media.filename}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X className="w-3 h-3 text-white" />
          </button>

          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
            {media.type === "image" ? (
              <Image className="w-4 h-4 text-white" />
            ) : (
              <Video className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ContentSection({
  formData,
  setFormData,
  setError,
  profile,
}) {
  const [upload, { loading: uploadLoading }] = useUpload();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto-resize textarea when content changes (including pre-population)
  useEffect(() => {
    if (textareaRef.current && formData.content) {
      autoResizeTextarea(textareaRef.current);
    }
  }, [formData.content]);

  const handleMediaUpload = async (files) => {
    for (const file of files) {
      try {
        const { url, mimeType, error } = await upload({ file });
        if (error) {
          setError(`Failed to upload ${file.name}: ${error}`);
          continue;
        }
        const mediaType = mimeType.startsWith("image/") ? "image" : "video";
        setFormData((prev) => ({
          ...prev,
          mediaItems: [
            ...prev.mediaItems,
            { type: mediaType, url, filename: file.name },
          ],
        }));
      } catch (err) {
        console.error("Upload error:", err);
        setError(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleRemoveMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      mediaItems: prev.mediaItems.filter((_, i) => i !== index),
    }));
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.type.startsWith("image/") || file.type.startsWith("video/"),
    );
    if (files.length > 0) {
      handleMediaUpload(files);
    }
  };

  // Auto-resize textarea function
  const autoResizeTextarea = (textarea) => {
    if (textarea) {
      textarea.style.height = "auto";
      const minHeight = 120; // 5 lines approximately
      textarea.style.height = Math.max(textarea.scrollHeight, minHeight) + "px";
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg p-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-semibold text-white">Global Content</h2>
          {profile && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100/10 text-gray-200 border border-gray-500/30">
              {profile.name}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">
          Write once, distribute everywhere
        </p>
      </div>

      <textarea
        ref={textareaRef}
        value={formData.content}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, content: e.target.value }));
          autoResizeTextarea(e.target);
        }}
        onInput={(e) => autoResizeTextarea(e.target)}
        placeholder="What's happening?"
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden leading-relaxed"
        style={{ minHeight: "120px", height: "120px" }}
        maxLength={2200}
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-400">
          {formData.content.length}/2200 characters
        </span>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-white mb-3">Media</h3>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragOver
              ? "border-blue-400 bg-blue-400/10"
              : "border-gray-600 hover:border-gray-500"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => handleMediaUpload(Array.from(e.target.files))}
            className="hidden"
          />

          <div className="space-y-4">
            <Upload
              className={`w-12 h-12 mx-auto transition-colors ${
                isDragOver ? "text-blue-400" : "text-gray-400"
              }`}
            />

            <div>
              <p
                className={`text-lg font-medium transition-colors ${
                  isDragOver ? "text-blue-300" : "text-white"
                }`}
              >
                {isDragOver
                  ? "Drop your files here"
                  : "Drag and drop your media files"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or click to select files
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 ${
                uploadLoading
                  ? "bg-gray-800/20 hover:bg-gray-800/30 border border-gray-600/50 hover:border-gray-500 text-gray-400"
                  : "bg-blue-800/20 hover:bg-blue-800/30 border border-blue-600/50 hover:border-blue-500 text-blue-400"
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadLoading ? "Uploading..." : "Add Media"}
            </button>
          </div>
        </div>

        {formData.mediaItems.length > 0 && (
          <MediaPreview
            mediaItems={formData.mediaItems}
            onRemove={handleRemoveMedia}
          />
        )}
      </div>
    </div>
  );
}
