"use client";
import { useState } from "react";
import useUser from "@/utils/useUser";
import usePosts from "@/hooks/usePosts";
import { canEditPost, canDeletePost } from "./posts/postsUtils";

import PostsHeader from "./posts/PostsHeader";
import DeletePostModal from "./posts/DeletePostModal";
import PostsToolbar from "./posts/PostsToolbar";
import PostsContent from "./posts/PostsContent";

export default function PostsTab({ selectedProfile }) {
  const { data: user } = useUser();

  const {
    posts,
    loading,
    error,
    setError,
    filters,
    pagination,
    handleFilterChange,
    setPagination,
    fetchPosts,
    clearFilters,
  } = usePosts(selectedProfile);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    postId: null,
    postContent: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Handle edit post
  const handleEditPost = (post) => {
    if (!canEditPost(post)) {
      setError(
        "This post cannot be edited. Only draft and scheduled posts can be modified.",
      );
      return;
    }

    // Navigate to edit page
    window.location.href = `/dashboard/profiles/${selectedProfile.id}/edit-post/${post.id}`;
  };

  // Handle delete post confirmation
  const handleDeleteConfirm = (post) => {
    if (!canDeletePost(post)) {
      setError(
        "This post cannot be deleted. Published posts cannot be removed.",
      );
      return;
    }

    setDeleteConfirm({
      show: true,
      postId: post.id,
      postContent: post.content,
    });
  };

  // Execute delete post
  const handleDeletePost = async () => {
    if (!deleteConfirm.postId) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/profiles/${selectedProfile.id}/posts/${deleteConfirm.postId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      // Close confirmation dialog
      setDeleteConfirm({ show: false, postId: null, postContent: null });

      // Refresh posts list
      await fetchPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel delete confirmation
  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, postId: null, postContent: null });
  };

  return (
    <div className="space-y-6">
      <PostsHeader selectedProfileId={selectedProfile?.id} />

      <DeletePostModal
        show={deleteConfirm.show}
        postContent={deleteConfirm.postContent}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeletePost}
        isLoading={deleteLoading}
      />

      <PostsToolbar filters={filters} onFilterChange={handleFilterChange} />

      <PostsContent
        viewMode="list"
        loading={loading}
        error={error}
        posts={posts}
        filters={filters}
        pagination={pagination}
        fetchPosts={fetchPosts}
        clearFilters={clearFilters}
        setPagination={setPagination}
        onEditPost={handleEditPost}
        onDeletePost={handleDeleteConfirm}
        userTimezone={user?.timezone}
      />
    </div>
  );
}
