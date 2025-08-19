"use client";
import { Edit, Save, X, Loader } from "lucide-react";

export default function EditProfileForm({
  editProfileData,
  setEditProfileData,
  handleSaveProfile,
  handleCancelEdit,
  savingProfile,
}) {
  const colorOptions = [
    "#4ade80",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ];

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/20 rounded-lg p-6 mb-8 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <Edit className="w-5 h-5 mr-2" />
        Edit Profile
      </h3>
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Name *
          </label>
          <input
            type="text"
            required
            value={editProfileData.name}
            onChange={(e) =>
              setEditProfileData({ ...editProfileData, name: e.target.value })
            }
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter profile name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={editProfileData.description}
            onChange={(e) =>
              setEditProfileData({
                ...editProfileData,
                description: e.target.value,
              })
            }
            rows={3}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter profile description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Color
          </label>
          <div className="flex flex-wrap gap-3 mb-3">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() =>
                  setEditProfileData((prev) => ({ ...prev, color }))
                }
                className={`w-10 h-10 rounded-full border-2 ${
                  editProfileData.color === color
                    ? "border-white ring-2 ring-blue-400"
                    : "border-gray-600 hover:border-gray-400"
                } transition-all`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">Selected:</span>
            <div
              className="w-4 h-4 rounded-full border border-gray-600"
              style={{ backgroundColor: editProfileData.color }}
            />
          </div>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() =>
              setEditProfileData({
                ...editProfileData,
                is_default: !editProfileData.is_default,
              })
            }
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors mr-3 ${
              editProfileData.is_default
                ? "bg-blue-500/80 backdrop-blur-sm"
                : "bg-gray-700/80 backdrop-blur-sm"
            } border ${
              editProfileData.is_default
                ? "border-blue-400/50"
                : "border-gray-600/50"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition-transform ${
                editProfileData.is_default ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <label className="text-sm text-gray-300">
            Set as default profile
          </label>
        </div>
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-600/20 text-blue-300 disabled:text-gray-400 border border-blue-500/30 disabled:border-gray-600/30 backdrop-blur-sm font-medium rounded-lg transition-all duration-200"
          >
            {savingProfile ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex items-center px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-white border border-gray-600/30 backdrop-blur-sm font-medium rounded-lg transition-all duration-200"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
