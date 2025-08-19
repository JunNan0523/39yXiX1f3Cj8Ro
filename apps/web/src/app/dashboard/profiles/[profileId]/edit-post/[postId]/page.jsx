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

export default function EditPostPage({ params }) {
  const { profileId, postId } = params;
  const { data: user } = useUser();
  const {
    profile,
    accounts,
    loading: profileLoading,
    error: fetchError,
  } = usePostProfileData(profileId);

  const [originalPost, setOriginalPost] = useState(null);
  const [postLoading, setPostLoading] = useState(true);
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

  // Fetch the post data and pre-populate form
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId || !profileId) {
        console.log("Missing postId or profileId:", { postId, profileId });
        return;
      }

      try {
        setPostLoading(true);
        setFormError(null);

        console.log("Fetching post data:", { profileId, postId });

        const response = await fetch(
          `/api/profiles/${profileId}/posts/${postId}`,
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API response error:", response.status, errorText);
          throw new Error(
            `Failed to fetch post: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        console.log("Raw API response:", data);

        // Fix nested post structure - API returns data.post.post
        let post = data.post;
        if (post && post.post) {
          // Handle double nested post structure
          post = post.post;
          console.log("Using nested post data:", post);
        }

        if (!post) {
          console.error("No post data in response:", data);
          throw new Error("No post data received from API");
        }

        console.log("Final post data for form:", post);
        setOriginalPost(post);

        // Pre-populate form data with better debugging and proper timezone handling
        const scheduledForValue = post.scheduledFor
          ? (() => {
              try {
                const date = new Date(post.scheduledFor);
                // Convert to user's timezone and format for datetime-local input
                const userTimezoneDatetime = new Intl.DateTimeFormat("sv-SE", {
                  timeZone: user?.timezone || "America/New_York",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).format(date);

                // Convert "YYYY-MM-DD HH:mm" to "YYYY-MM-DDTHH:mm"
                return userTimezoneDatetime.replace(" ", "T");
              } catch (error) {
                console.error("Error formatting scheduled date:", error);
                return "";
              }
            })()
          : "";

        const populatedFormData = {
          content: post.content || "",
          scheduledFor: scheduledForValue,
          publishNow: false,
          isDraft: post.status === "draft",
          platforms: post.platforms || [],
          mediaItems: post.mediaItems || [],
          tags: post.tags || [],
        };

        console.log("Populated form data:", populatedFormData);
        setFormData(populatedFormData);

        // Pre-populate platform-specific data with debugging
        const instagramPlatform = post.platforms?.find(
          (p) => p.platform === "instagram",
        );
        if (instagramPlatform) {
          if (instagramPlatform.platformSpecificData?.contentType) {
            console.log(
              "Setting Instagram content type:",
              instagramPlatform.platformSpecificData.contentType,
            );
            setInstagramContentType(
              instagramPlatform.platformSpecificData.contentType,
            );
          }

          // Set Instagram fields from existing data
          const instagramData = {
            thumbnail: instagramPlatform.instagramThumbnail || null,
            collaborators:
              instagramPlatform.platformSpecificData?.collaborators || [],
          };
          console.log("Setting Instagram fields:", instagramData);
          setInstagramFields(instagramData);
        }

        const youtubePlatform = post.platforms?.find(
          (p) => p.platform === "youtube",
        );
        if (youtubePlatform?.platformSpecificData) {
          const ytData = youtubePlatform.platformSpecificData;
          console.log("Setting YouTube fields:", ytData);

          // Extract YouTube thumbnail from mediaItems if it exists
          let youtubeThumbnail = null;
          const videoItem = post.mediaItems?.find(
            (item) => item.type === "video" && item.thumbnail,
          );
          if (videoItem?.thumbnail) {
            youtubeThumbnail = videoItem.thumbnail;
          }

          setYoutubeFields({
            title: ytData.title || "", // Extract title from platformSpecificData
            description: "", // Description is read-only, comes from global content
            tags: post.tags ? post.tags.join(", ") : "", // Tags come from top level now
            thumbnail: youtubeThumbnail,
            firstComment: ytData.firstComment || "",
            includeFirstComment: !!ytData.firstComment,
          });
        } else if (post.platforms?.some((p) => p.platform === "youtube")) {
          // YouTube platform exists but no platform specific data, still set tags from top level
          setYoutubeFields((prev) => ({
            ...prev,
            tags: post.tags ? post.tags.join(", ") : "",
          }));
        }

        const twitterPlatform = post.platforms?.find(
          (p) => p.platform === "twitter",
        );
        if (twitterPlatform?.platformSpecificData?.threadItems) {
          console.log(
            "Setting Twitter thread:",
            twitterPlatform.platformSpecificData.threadItems,
          );
          setTwitterFields({
            isThread: true,
            threadItems: twitterPlatform.platformSpecificData.threadItems,
          });
        }

        console.log("Form pre-population completed successfully");
      } catch (err) {
        console.error("Error fetching post:", err);
        setFormError(`Failed to load post data: ${err.message}`);
      } finally {
        setPostLoading(false);
      }
    };

    fetchPost();
  }, [profileId, postId, user]); // Added user as dependency since we use user.timezone

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
        timezone: user?.timezone || "America/New_York", // Only use user timezone, not profile
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

      // Use PUT request for updating
      const response = await fetch(
        `/api/profiles/${profileId}/posts/${postId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update post");
      }

      window.location.href = `/dashboard?profile=${profileId}&tab=posts`;
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = `/dashboard?profile=${profileId}&tab=posts`;
  };

  const handleGoToConnection = () => {
    window.location.href = `/dashboard?profile=${profileId}&tab=connection`;
  };

  const loading = profileLoading || postLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!originalPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Post Not Found</h2>
          <p className="text-gray-400 mb-4">
            The post you're trying to edit doesn't exist or cannot be edited.
          </p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  const anyError = formError || fetchError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CreatePostHeader profileId={profileId} isEdit={true} />

        {/* Post Status Info */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Post Status</h3>
              <p className="text-gray-400">
                Status:{" "}
                <span className="capitalize text-blue-300">
                  {originalPost.status}
                </span>
                {originalPost.scheduledFor && (
                  <>
                    {" "}
                    • Scheduled:{" "}
                    {new Date(originalPost.scheduledFor).toLocaleString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: user?.timezone || "America/New_York",
                      },
                    )}
                  </>
                )}
              </p>
            </div>
            {(originalPost.status === "published" ||
              originalPost.status === "publishing") && (
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  ⚠️ This post cannot be edited because it's already published or
                  being published.
                </p>
              </div>
            )}
          </div>
        </div>

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
            timezone={user?.timezone || "America/New_York"} // Only use user timezone, not profile
            isEdit={true}
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
                  Updating Post...
                </>
              ) : formData.isDraft ? (
                "Save Changes"
              ) : formData.publishNow ? (
                "Update & Publish Now"
              ) : (
                "Update Schedule"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
