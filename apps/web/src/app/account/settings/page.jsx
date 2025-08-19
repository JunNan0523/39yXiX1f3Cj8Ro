"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import { ArrowLeft, Save, Camera, User, Clock, X } from "lucide-react";

export default function UserSettingsPage() {
  const { data: user, loading: userLoading, refetch } = useUser();
  const [upload, { loading: uploadLoading }] = useUpload();
  
  const [formData, setFormData] = useState({
    name: "",
    timezone: "America/New_York",
    image: null,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Common timezone options
  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
    { value: "Europe/London", label: "GMT (London)" },
    { value: "Europe/Paris", label: "CET (Paris)" },
    { value: "Europe/Berlin", label: "CET (Berlin)" },
    { value: "Asia/Tokyo", label: "JST (Tokyo)" },
    { value: "Asia/Shanghai", label: "CST (Shanghai)" },
    { value: "Asia/Kolkata", label: "IST (India)" },
    { value: "Australia/Sydney", label: "AEST (Sydney)" },
    { value: "UTC", label: "UTC" },
  ];

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/account/signin";
    }
  }, [user, userLoading]);

  // Fetch current user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setFormData({
          name: data.user.name || "",
          timezone: data.user.timezone || "America/New_York",
          image: data.user.image || null,
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile settings");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSuccess(false);
    setError(null);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { url, error: uploadError } = await upload({ file });
      if (uploadError) {
        setError(uploadError);
        return;
      }
      
      handleInputChange("image", url);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image");
    }
  };

  const handleRemoveImage = () => {
    handleInputChange("image", null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      await refetch(); // Refresh user data
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    window.location.href = "/dashboard";
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-lg border-4 border-gray-700"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-lg border-4 border-transparent border-t-blue-400 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-900/80 shadow-lg border-b border-gray-700/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-400 hover:text-white transition-colors mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Account Settings</h1>
              <p className="text-sm text-gray-400">Manage your profile and preferences</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/20 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Success Message */}
            {success && (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <p className="text-green-400 font-medium">Settings saved successfully!</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Profile Picture Section */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Profile Picture
              </h2>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {formData.image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadLoading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors cursor-pointer ${
                      uploadLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {uploadLoading ? "Uploading..." : "Upload Photo"}
                  </label>
                  <p className="text-sm text-gray-400 mt-2">
                    JPG, PNG up to 5MB. Recommended: 400x400px
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full px-4 py-3 bg-gray-600/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </div>

            {/* Timezone Settings */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Timezone Settings
              </h2>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => handleInputChange("timezone", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  This will be used to display all dates and schedule posts in your local time.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}