"use client";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import useUser from "@/utils/useUser";
import usePostProfileData from "@/hooks/usePostProfileData";
import CreatePostHeader from "@/components/dashboard/create-post/CreatePostHeader";
import ContentSection from "@/components/dashboard/create-post/ContentSection";
import PlatformSelector from "@/components/dashboard/create-post/PlatformSelector";
import InstagramOptions from "@/components/dashboard/create-post/InstagramOptions";
import YouTubeOptions from "@/components/dashboard/create-post/YouTubeOptions";
import TwitterThreadEditor from "@/components/dashboard/create-post/TwitterThreadEditor";
import SchedulingSection from "@/components/dashboard/create-post/SchedulingSection";

export default function CreatePostPage({ params }) {
  const { profileId } = params;
  const { data: user } = useUser();
  const {
    profile,
    accounts,
    loading,
    error: fetchError,
  } = usePostProfileData(profileId);

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    content: "",
    scheduledFor: "",
    publishNow: false,
    isDraft: false,
    platforms: [],
    mediaItems: [],
    tags: [],
  });

  const [instagramContentType, setInstagramContentType] = useState("post");
  const [instagramFields, setInstagramFields] = useState({
    thumbnail: null,
    collaborators: [],
  });
  const [youtubeFields, setYoutubeFields] = useState({
    title: "",
    description: "",
    tags: "",
    thumbnail: null,
    firstComment: "",
    includeFirstComment: false,
  });
  const [twitterFields, setTwitterFields] = useState({
    isThread: false,
    threadItems: [],
  });

  // Check for scheduledFor parameter on page load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const scheduledForParam = urlParams.get("scheduledFor");

      if (scheduledForParam) {
        try {
          const scheduledDate = new Date(decodeURIComponent(scheduledForParam));
          if (!isNaN(scheduledDate.getTime())) {
            // Format for datetime-local input: YYYY-MM-DDTHH:mm
            const formattedDateTime = scheduledDate.toISOString().slice(0, 16);
            setFormData((prev) => ({
              ...prev,
              scheduledFor: formattedDateTime,
              publishNow: false,
              isDraft: false,
            }));
          }
        } catch (error) {
          console.error("Error parsing scheduledFor parameter:", error);
        }
      }
    }
  }, []);

  const setError = (err) => {
    setFormError(err);
    if (err) {
      window.scrollTo(0, 0);
    }
  };

  const handlePlatformToggle = (platform, accountId) => {
    setFormData((prev) => {
      const isSelected = prev.platforms.some((p) => p.platform === platform);
      if (isSelected) {
        return {
          ...prev,
          platforms: prev.platforms.filter((p) => p.platform !== platform),
        };
      } else {
        const newPlatform = { platform, accountId, platformSpecificData: {} };
        return { ...prev, platforms: [...prev.platforms, newPlatform] };
      }
    });
  };

  const isPlatformSelected = (platform) => {
    return formData.platforms.some((p) => p.platform === platform);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }
    if (formData.platforms.length === 0) {
      setError("Select at least one platform");
      return;
    }
    if (!formData.publishNow && !formData.isDraft && !formData.scheduledFor) {
      setError("Please set a schedule time or choose to publish now");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Check if YouTube is selected to determine if we need top-level tags
      const hasYouTube = formData.platforms.some(
        (p) => p.platform === "youtube",
      );

      // Process media items to handle YouTube thumbnails properly
      const processedMediaItems = [...formData.mediaItems];

      // If YouTube is selected and has thumbnail, add thumbnail to video media items
      if (
        hasYouTube &&
        youtubeFields.thumbnail &&
        processedMediaItems.length > 0
      ) {
        // Find the first video item and add thumbnail to it
        const videoItem = processedMediaItems.find(
          (item) => item.type === "video",
        );
        if (videoItem) {
          videoItem.thumbnail = youtubeFields.thumbnail;
        }
      }

      const postData = {
        ...formData,
        scheduledFor: formData.publishNow ? null : formData.scheduledFor,
        timezone: user?.timezone || "America/New_York",
        // Add YouTube tags at top level if YouTube is selected and has tags
        ...(hasYouTube &&
          youtubeFields.tags && {
            tags: youtubeFields.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag),
          }),
        platforms: formData.platforms.map((p) => {
          const platformData = { ...p };
          if (p.platform === "instagram") {
            platformData.platformSpecificData = {
              contentType: instagramContentType,
              ...(instagramFields.collaborators.length > 0 && {
                collaborators: instagramFields.collaborators,
              }),
            };
            // Add Instagram thumbnail at the platform level
            if (instagramFields.thumbnail) {
              platformData.instagramThumbnail = instagramFields.thumbnail;
            }
          }
          if (p.platform === "youtube") {
            // Include title and firstComment in platformSpecificData for YouTube
            platformData.platformSpecificData = {
              ...(youtubeFields.title && { title: youtubeFields.title }),
              ...(youtubeFields.includeFirstComment && {
                firstComment: youtubeFields.firstComment,
              }),
            };
          }
          if (p.platform === "twitter" && twitterFields.isThread) {
            platformData.platformSpecificData = {
              threadItems: twitterFields.threadItems,
            };
          }
          return platformData;
        }),
        mediaItems: processedMediaItems,
      };

      const response = await fetch(`/api/profiles/${profileId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      // Check if we came from calendar (has scheduledFor parameter)
      const urlParams = new URLSearchParams(window.location.search);
      const scheduledForParam = urlParams.get("scheduledFor");
      const tab = scheduledForParam ? "calendar" : "posts";

      window.location.href = `/dashboard?profile=${profileId}&tab=${tab}`;
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Check if we came from calendar (has scheduledFor parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const scheduledForParam = urlParams.get("scheduledFor");
    const tab = scheduledForParam ? "calendar" : "posts";

    window.location.href = `/dashboard?profile=${profileId}&tab=${tab}`;
  };

  const handleGoToConnection = () => {
    window.location.href = `/dashboard?profile=${profileId}&tab=connection`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const anyError = formError || fetchError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CreatePostHeader profileId={profileId} />

        {anyError && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-400">{anyError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <ContentSection
            formData={formData}
            setFormData={setFormData}
            setError={setError}
            profile={profile}
          />

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Platforms</h2>
            <PlatformSelector
              accounts={accounts}
              selectedPlatforms={formData.platforms}
              onPlatformToggle={handlePlatformToggle}
              mediaItems={formData.mediaItems}
              onGoToConnection={handleGoToConnection}
            />
            {isPlatformSelected("instagram") && (
              <InstagramOptions
                instagramContentType={instagramContentType}
                setInstagramContentType={setInstagramContentType}
                instagramFields={instagramFields}
                setInstagramFields={setInstagramFields}
                setError={setError}
                mediaItems={formData.mediaItems}
              />
            )}
            {isPlatformSelected("youtube") && (
              <YouTubeOptions
                youtubeFields={youtubeFields}
                setYoutubeFields={setYoutubeFields}
                setError={setError}
                globalContent={formData.content}
              />
            )}
            {isPlatformSelected("twitter") && (
              <TwitterThreadEditor
                twitterFields={twitterFields}
                setTwitterFields={setTwitterFields}
                mainContent={formData.content}
              />
            )}
          </div>

          <SchedulingSection
            formData={formData}
            setFormData={setFormData}
            timezone={user?.timezone || "America/New_York"}
          />

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || formData.platforms.length === 0}
              className={`flex items-center px-6 py-3 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                formData.isDraft
                  ? "bg-yellow-800/20 hover:bg-yellow-800/30 border border-yellow-600/50 hover:border-yellow-500 text-yellow-400"
                  : formData.publishNow
                    ? "bg-green-800/20 hover:bg-green-800/30 border border-green-600/50 hover:border-green-500 text-green-400"
                    : "bg-blue-800/20 hover:bg-blue-800/30 border border-blue-600/50 hover:border-blue-500 text-blue-400"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Post...
                </>
              ) : formData.isDraft ? (
                "Save Draft"
              ) : formData.publishNow ? (
                "Publish Now"
              ) : (
                "Schedule Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
