"use client";
import { useState, useEffect } from "react";

export default function usePostProfileData(profileId) {
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const profileResponse = await fetch(`/api/profiles/${profileId}`);
        if (!profileResponse.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileResponse.json();
        setProfile(profileData.profile);

        const accountsResponse = await fetch(
          `/api/profiles/${profileId}/accounts`,
        );
        if (!accountsResponse.ok) throw new Error("Failed to fetch accounts");
        const accountsData = await accountsResponse.json();
        setAccounts(
          accountsData.accounts?.filter((acc) => acc.is_active) || [],
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profileId]);

  return { profile, accounts, loading, error };
}
