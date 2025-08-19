"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

export default function usePosts(selectedProfile, options = {}) {
  const { calendarMode = false, dateRange = null } = options;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    platform: "all",
    dateFilter: "all",
    customStartDate: "",
    customEndDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: calendarMode ? 50 : 10, // Reduced limit for calendar mode to prevent API timeouts
    total: 0,
  });

  // Stabilize dateRange to prevent infinite loops
  const stableDateRange = useMemo(() => {
    if (!dateRange || !dateRange.start || !dateRange.end) return null;
    return {
      start: dateRange.start,
      end: dateRange.end,
    };
  }, [dateRange?.start?.getTime(), dateRange?.end?.getTime()]);

  const fetchPosts = useCallback(async () => {
    if (!selectedProfile) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // For calendar mode, use higher limit and date range if provided
      if (calendarMode) {
        params.set("limit", "50"); // Reduced from 1000 to prevent timeouts
        if (stableDateRange && stableDateRange.start && stableDateRange.end) {
          params.set(
            "startDate",
            stableDateRange.start.toISOString().split("T")[0],
          );
          params.set(
            "endDate",
            stableDateRange.end.toISOString().split("T")[0],
          );
        }
      } else {
        params.set("page", pagination.page.toString());
        params.set("limit", pagination.limit.toString());
      }

      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.platform !== "all") params.set("platform", filters.platform);
      if (filters.dateFilter !== "all")
        params.set("dateFilter", filters.dateFilter);
      if (filters.customStartDate)
        params.set("startDate", filters.customStartDate);
      if (filters.customEndDate) params.set("endDate", filters.customEndDate);

      const response = await fetch(
        `/api/profiles/${selectedProfile.id}/posts?${params.toString()}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data.posts || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
      }));
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    selectedProfile,
    filters,
    pagination.page,
    pagination.limit,
    calendarMode,
    stableDateRange,
  ]);

  useEffect(() => {
    if (selectedProfile) {
      fetchPosts();
    }
  }, [selectedProfile, filters, pagination.page, fetchPosts]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    if (!calendarMode) {
      setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page for list view
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      platform: "all",
      dateFilter: "all",
      customStartDate: "",
      customEndDate: "",
    });
    if (!calendarMode) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  return {
    posts,
    setPosts,
    loading,
    error,
    setError,
    filters,
    pagination,
    handleFilterChange,
    setPagination,
    fetchPosts,
    clearFilters,
  };
}
