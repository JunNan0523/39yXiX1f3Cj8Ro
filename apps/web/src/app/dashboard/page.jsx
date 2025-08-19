"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import DashboardLoadingScreen from "@/components/dashboard/DashboardLoadingScreen";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import NoProfilesView from "@/components/dashboard/NoProfilesView";
import ProfileSelector from "@/components/dashboard/ProfileSelector";
import ProfileManager from "@/components/dashboard/ProfileManager";
import ConnectionManager from "@/components/dashboard/ConnectionManager";
import ErrorAlert from "@/components/dashboard/ErrorAlert";
import TabNavigation from "@/components/dashboard/TabNavigation";
import PostsTab from "@/components/dashboard/PostsTab";
import CalendarTab from "@/components/dashboard/CalendarTab";
import TeamsTab from "@/components/dashboard/TeamsTab";
import CreateProfileForm from "@/components/dashboard/CreateProfileForm";

export default function DashboardPage() {
  const { data: user, loading } = useUser();
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [disconnectingAccount, setDisconnectingAccount] = useState(null);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    is_default: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormError, setCreateFormError] = useState(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [editingProfile, setEditingProfile] = useState(false);

  // Helper function to get display name
  const getDisplayName = (user) => {
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  // Handle URL parameters for tab and profile selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      const profileParam = urlParams.get("profile");

      // Set active tab from URL parameter
      if (
        tabParam &&
        ["posts", "connection", "calendar", "teams"].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }

      // Set selected profile from URL parameter (will be handled after profiles are loaded)
      if (profileParam && profiles.length > 0) {
        const targetProfile = profiles.find(
          (p) => p.id.toString() === profileParam,
        );
        if (targetProfile) {
          console.log(
            "URL: Selecting profile from URL parameter:",
            targetProfile.name,
          );
          setSelectedProfile(targetProfile);
          // Store in localStorage when selected from URL
          localStorage.setItem(
            "selectedProfileId",
            targetProfile.id.toString(),
          );

          // Clear any cached accounts to force refresh
          setAccounts([]);

          // Clear URL parameters after handling them
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        }
      }
    }
  }, [profiles]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/account/signin";
    }
  }, [user, loading]);

  // Fetch profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setProfilesLoading(true);
        const response = await fetch("/api/profiles");
        if (!response.ok) throw new Error("Failed to fetch profiles");

        const data = await response.json();
        const profilesData = data.profiles || [];
        setProfiles(profilesData);

        // Handle profile selection with localStorage persistence
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const profileParam = urlParams.get("profile");

          if (!profileParam && profilesData.length > 0) {
            // Try to get previously selected profile from localStorage
            const storedProfileId = localStorage.getItem("selectedProfileId");

            if (storedProfileId) {
              const storedProfile = profilesData.find(
                (p) => p.id.toString() === storedProfileId,
              );
              if (storedProfile) {
                console.log("Loading stored profile:", storedProfile.name);
                setSelectedProfile(storedProfile);
                return;
              } else {
                // If stored profile no longer exists, clear localStorage
                localStorage.removeItem("selectedProfileId");
              }
            }

            // Fallback to default profile only if no valid stored profile
            const defaultProfile = profilesData.find((p) => p.is_default);
            const profileToSelect = defaultProfile || profilesData[0];
            setSelectedProfile(profileToSelect);
            localStorage.setItem(
              "selectedProfileId",
              profileToSelect.id.toString(),
            );
          }
        } else if (profilesData.length > 0) {
          const defaultProfile = profilesData.find((p) => p.is_default);
          const profileToSelect = defaultProfile || profilesData[0];
          setSelectedProfile(profileToSelect);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError("Failed to load profiles");
      } finally {
        setProfilesLoading(false);
      }
    };
    if (user) fetchProfiles();
  }, [user]);

  // Fetch accounts when profile is selected
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!selectedProfile) {
        setAccounts([]);
        return;
      }
      try {
        setAccountsLoading(true);
        setError(null);
        console.log(
          "Fetching accounts for profile:",
          selectedProfile.name,
          selectedProfile.id,
        );
        const response = await fetch(
          `/api/profiles/${selectedProfile.id}/accounts`,
        );
        if (!response.ok) throw new Error("Failed to load social accounts");

        const data = await response.json();
        console.log("Fetched accounts:", data.accounts);
        setAccounts(data.accounts || []);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("Failed to load accounts");
      } finally {
        setAccountsLoading(false);
      }
    };
    if (user && selectedProfile) fetchAccounts();
  }, [user, selectedProfile]);

  // Refresh accounts when switching to connection tab
  useEffect(() => {
    const refreshAccountsForConnectionTab = async () => {
      if (activeTab !== "connection" || !selectedProfile || !user) {
        return;
      }

      console.log(
        "Connection tab: Refreshing accounts for profile:",
        selectedProfile.name,
        selectedProfile.id,
      );

      try {
        setAccountsLoading(true);
        setError(null);
        const response = await fetch(
          `/api/profiles/${selectedProfile.id}/accounts`,
        );
        if (!response.ok) throw new Error("Failed to load social accounts");

        const data = await response.json();
        console.log("Connection tab: Refreshed accounts:", data.accounts);
        setAccounts(data.accounts || []);
      } catch (err) {
        console.error("Error fetching accounts for connection tab:", err);
        setError("Failed to load accounts");
      } finally {
        setAccountsLoading(false);
      }
    };

    refreshAccountsForConnectionTab();
  }, [activeTab, selectedProfile, user]);

  const handleConnectPlatform = async (platform) => {
    if (!selectedProfile) return;
    setConnectingPlatform(platform);
    setError(null);
    try {
      const response = await fetch(
        `/api/profiles/${selectedProfile.id}/connect/${platform}`,
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate connection");
      }
      const data = await response.json();
      if (data.authUrl) {
        window.open(data.authUrl, "_blank");
        // Simplified polling - just refetch accounts
        const poll = setInterval(async () => {
          const accountsResponse = await fetch(
            `/api/profiles/${selectedProfile.id}/accounts`,
          );
          if (accountsResponse.ok) {
            const accountsData = await accountsResponse.json();
            setAccounts(accountsData.accounts || []);
            const connected = accountsData.accounts?.some(
              (acc) => acc.platform === platform && acc.is_active,
            );
            if (connected) {
              clearInterval(poll);
              setConnectingPlatform(null);
            }
          }
        }, 3000);
        setTimeout(() => {
          clearInterval(poll);
          setConnectingPlatform(null);
        }, 300000); // 5 min timeout
      }
    } catch (err) {
      console.error("Error connecting platform:", err);
      setError(err.message);
      setConnectingPlatform(null);
    }
  };

  const handleDisconnectAccount = async (accountInfo) => {
    if (!accountInfo || !accountInfo.id || !selectedProfile) return;
    if (
      !window.confirm(
        `Are you sure you want to disconnect @${accountInfo.username} from ${accountInfo.platform}?`,
      )
    )
      return;

    setDisconnectingAccount(accountInfo.id);
    setError(null);
    try {
      const response = await fetch(
        `/api/profiles/${selectedProfile.id}/accounts?accountId=${accountInfo.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to disconnect account");
      }
      setAccounts(accounts.filter((acc) => acc.id !== accountInfo.id));
    } catch (err) {
      console.error("Error disconnecting account:", err);
      setError(err.message);
    } finally {
      setDisconnectingAccount(null);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!selectedProfile) return false;

    setSavingProfile(true);
    setError(null);
    try {
      const response = await fetch(`/api/profiles/${selectedProfile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProfileData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      const data = await response.json();
      const updatedProfile = data.profile;
      setSelectedProfile(updatedProfile);

      // If the updated profile is set as default, update other profiles to not be default
      const updatedProfiles = profiles
        .map((p) => {
          if (p.id === updatedProfile.id) {
            return updatedProfile;
          }
          // If updatedProfile is now default, other profiles should not be default
          return {
            ...p,
            is_default: updatedProfile.is_default ? false : p.is_default,
          };
        })
        .sort((a, b) => {
          // Sort by default status first
          if (a.is_default && !b.is_default) return -1;
          if (!a.is_default && b.is_default) return 1;
          return new Date(a.created_at) - new Date(b.created_at);
        });

      setProfiles(updatedProfiles);
      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
      return false;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfile) return;
    if (accounts.some((acc) => acc.is_active)) {
      setError(
        "Cannot delete profile with connected social media accounts. Please disconnect all accounts first.",
      );
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete "${selectedProfile.name}"? This action cannot be undone.`,
      )
    )
      return;

    setDeletingProfile(true);
    setError(null);
    try {
      const response = await fetch(`/api/profiles/${selectedProfile.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete profile");
      }
      const updatedProfiles = profiles.filter(
        (p) => p.id !== selectedProfile.id,
      );
      setProfiles(updatedProfiles);

      // Clear deleted profile from localStorage
      localStorage.removeItem("selectedProfileId");

      if (updatedProfiles.length > 0) {
        const defaultProfile = updatedProfiles.find((p) => p.is_default);
        const newSelectedProfile = defaultProfile || updatedProfiles[0];
        setSelectedProfile(newSelectedProfile);
        // Store new selection in localStorage
        localStorage.setItem(
          "selectedProfileId",
          newSelectedProfile.id.toString(),
        );
      } else {
        setSelectedProfile(null);
        setAccounts([]);
      }
    } catch (err) {
      console.error("Error deleting profile:", err);
      setError(err.message);
    } finally {
      setDeletingProfile(false);
    }
  };

  // New handlers for profile actions
  const handleEditProfile = () => {
    if (selectedProfile) {
      setEditProfileData({
        name: selectedProfile.name || "",
        description: selectedProfile.description || "",
        color: selectedProfile.color || "#3B82F6",
        is_default: selectedProfile.is_default || false,
      });
      setEditingProfile(true);
    }
  };

  // Updated create profile handler
  const handleCreateProfile = () => {
    setShowCreateForm(true);
    setCreateFormError(null);
    setError(null);
  };

  const handleCancelCreateProfile = () => {
    setShowCreateForm(false);
    setCreateFormError(null);
  };

  const handleSubmitCreateProfile = async (formData) => {
    setIsCreatingProfile(true);
    setCreateFormError(null);

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create profile");
      }

      const data = await response.json();
      const newProfile = data.profile;

      // If the new profile is set as default, update existing profiles to not be default
      const updatedProfiles = profiles.map((p) => ({
        ...p,
        is_default: newProfile.is_default ? false : p.is_default,
      }));

      // Add new profile and sort by default status
      const newProfilesList = [...updatedProfiles, newProfile].sort((a, b) => {
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        return new Date(a.created_at) - new Date(b.created_at);
      });

      setProfiles(newProfilesList);
      setSelectedProfile(newProfile);
      // Store newly created and selected profile in localStorage
      localStorage.setItem("selectedProfileId", newProfile.id.toString());
      console.log(
        "New profile created and stored in localStorage:",
        newProfile.name,
      );
      setShowCreateForm(false);
      setCreateFormError(null);
    } catch (error) {
      console.error("Error creating profile:", error);
      setCreateFormError(error.message);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleSignOut = () => {
    window.location.href = "/account/logout";
  };
  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setError(null);
    // Store selected profile in localStorage for persistence
    localStorage.setItem("selectedProfileId", profile.id.toString());
    console.log("Profile selection stored in localStorage:", profile.name);
  };

  // Function to render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "connection":
        return (
          <ConnectionManager
            selectedProfile={selectedProfile}
            accounts={accounts}
            accountsLoading={accountsLoading}
            handleConnectPlatform={handleConnectPlatform}
            handleDisconnectAccount={handleDisconnectAccount}
            connectingPlatform={connectingPlatform}
            disconnectingAccount={disconnectingAccount}
          />
        );
      case "posts":
        return <PostsTab selectedProfile={selectedProfile} />;
      case "calendar":
        return <CalendarTab selectedProfile={selectedProfile} />;
      case "teams":
        return <TeamsTab />;
      default:
        return null;
    }
  };

  if (loading || !user) {
    return <DashboardLoadingScreen />;
  }

  const renderContent = () => {
    if (profilesLoading) {
      return (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-0"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-75"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-150"></div>
            </div>
            <p className="text-gray-400 text-sm mt-3">Loading profiles...</p>

            <style jsx global>{`
              .animation-delay-0 {
                animation-delay: 0ms;
              }
              .animation-delay-75 {
                animation-delay: 200ms;
              }
              .animation-delay-150 {
                animation-delay: 400ms;
              }
            `}</style>
          </div>
        </div>
      );
    }

    // Show create form if requested
    if (showCreateForm) {
      return (
        <CreateProfileForm
          onCancel={handleCancelCreateProfile}
          onSuccess={handleSubmitCreateProfile}
          error={createFormError}
          isSubmitting={isCreatingProfile}
        />
      );
    }

    if (profiles.length === 0) {
      return <NoProfilesView onCreateProfile={handleCreateProfile} />;
    }
    return (
      <div>
        <ProfileSelector
          profiles={profiles}
          selectedProfile={selectedProfile}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onEditProfile={handleEditProfile}
          onDeleteProfile={handleDeleteProfile}
        />
        {selectedProfile && (
          <ProfileManager
            selectedProfile={selectedProfile}
            editProfileData={editProfileData}
            setEditProfileData={setEditProfileData}
            handleSaveProfile={handleSaveProfile}
            savingProfile={savingProfile}
            handleDeleteProfile={handleDeleteProfile}
            deletingProfile={deletingProfile}
            editingProfile={editingProfile}
            setEditingProfile={setEditingProfile}
          />
        )}
        <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/20 rounded-lg p-8 shadow-lg">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          {renderTabContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <DashboardHeader user={user} onSignOut={handleSignOut} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center mb-4">
            <h2 className="text-3xl font-bold text-white">
              Welcome, {getDisplayName(user)}
            </h2>
          </div>
          <p className="text-gray-400 text-lg">
            Choose a profile to manage your social media accounts and schedule
            posts.
          </p>
        </div>
        <ErrorAlert message={error} />
        {renderContent()}
      </main>
    </div>
  );
}
