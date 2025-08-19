import { useState, useMemo, useCallback } from "react";
import { format, startOfDay, setHours, setMinutes } from "date-fns";
import { toast } from "sonner";

export function useCalendarInteractions(
  selectedProfile,
  { posts, setPosts, fetchPosts },
) {
  const [draggedPost, setDraggedPost] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [updatingPosts, setUpdatingPosts] = useState(new Set());

  const postsByDate = useMemo(() => {
    const grouped = {};
    if (posts) {
      posts.forEach((post) => {
        if (post.scheduledFor) {
          const dateKey = format(new Date(post.scheduledFor), "yyyy-MM-dd");
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(post);
        }
      });
    }
    return grouped;
  }, [posts]);

  const handleDragStart = useCallback((e, post) => {
    setDraggedPost(post);
    setDragPreview(null);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback(
    (e, day, preciseTime = null) => {
      e.preventDefault();
      if (draggedPost && day) {
        setDragPreview({
          post: draggedPost,
          targetDay: day,
          targetTime: preciseTime,
        });
      }
    },
    [draggedPost],
  );

  const handleDragLeave = useCallback(() => {
    // Deliberately empty to avoid flickering in month view
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedPost(null);
    setDragPreview(null);
  }, []);

  const handleDrop = useCallback(
    async (e, targetDay, preciseTime = null) => {
      e.preventDefault();
      if (!draggedPost || !selectedProfile) return;

      const postId = draggedPost._id || draggedPost.id;
      setDraggedPost(null);
      setDragPreview(null);

      try {
        let newDateTime;
        if (preciseTime) {
          newDateTime = preciseTime;
        } else {
          const originalTime = draggedPost.scheduledFor
            ? new Date(draggedPost.scheduledFor)
            : null;
          newDateTime = originalTime
            ? setMinutes(
                setHours(startOfDay(targetDay), originalTime.getHours()),
                originalTime.getMinutes(),
              )
            : setHours(startOfDay(targetDay), 9);
        }

        setUpdatingPosts((prev) => new Set(prev).add(postId));
        const updatedPost = {
          ...draggedPost,
          scheduledFor: newDateTime.toISOString(),
        };
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            (post._id || post.id) === postId ? updatedPost : post,
          ),
        );

        // Backend now handles GET+merge+PUT workflow automatically
        const response = await fetch(
          `/api/profiles/${selectedProfile.id}/posts/${postId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scheduledFor: newDateTime.toISOString() }),
          },
        );

        if (!response.ok) throw new Error("Failed to update post schedule");

        toast.success("Post rescheduled!", {
          description: `Moved to ${format(targetDay, "MMM d, yyyy")} at ${format(newDateTime, "h:mm a")}`,
          duration: 2000,
        });
      } catch (err) {
        console.error("Error updating post schedule:", err);
        await fetchPosts();
        toast.error("Failed to reschedule", {
          description: "The post has been reverted to its original schedule",
          duration: 4000,
        });
      } finally {
        setUpdatingPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [draggedPost, selectedProfile, fetchPosts, setPosts],
  );

  const handleCreatePost = useCallback(
    (dayOrDateTime) => {
      if (!selectedProfile) return;
      let defaultTime =
        dayOrDateTime instanceof Date && dayOrDateTime.getHours() !== 0
          ? dayOrDateTime
          : setHours(startOfDay(dayOrDateTime), 9);
      const dateParam = encodeURIComponent(defaultTime.toISOString());
      window.location.href = `/dashboard/profiles/${selectedProfile.id}/create-post?scheduledFor=${dateParam}`;
    },
    [selectedProfile],
  );

  return {
    draggedPost,
    dragPreview,
    updatingPosts,
    postsByDate,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    handleCreatePost,
  };
}
