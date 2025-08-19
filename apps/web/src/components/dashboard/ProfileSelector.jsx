"use client";
import { useState } from "react";
import { ChevronDown, Plus, Edit, Trash2 } from "lucide-react";

export default function ProfileSelector({
  profiles,
  selectedProfile,
  onSelectProfile,
  onCreateProfile,
  onEditProfile,
  onDeleteProfile,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (profile) => {
    onSelectProfile(profile);
    setShowDropdown(false);
  };

  const handleCreate = () => {
    onCreateProfile();
    setShowDropdown(false);
  };

  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="relative flex-1 max-w-md">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full bg-gray-800/80 backdrop-blur-xl border border-gray-700/20 rounded-lg p-4 flex items-center justify-between text-left hover:bg-gray-700/80 transition-all duration-200"
        >
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-sm mr-3"
              style={{ backgroundColor: selectedProfile?.color || "#3B82F6" }}
            ></div>
            <span className="text-white font-medium">
              {selectedProfile?.name || "Select Profile"}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl border border-gray-700/20 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleSelect(profile)}
                className="w-full p-4 text-left hover:bg-gray-700/50 transition-colors duration-150 border-b border-gray-700/20 last:border-b-0 flex items-center"
              >
                <div
                  className="w-4 h-4 rounded-sm mr-3 shadow-sm"
                  style={{ backgroundColor: profile.color }}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium">{profile.name}</h3>
                    {profile.is_default && (
                      <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {profile.description || "No description provided"}
                  </p>
                </div>
              </button>
            ))}
            <button
              onClick={handleCreate}
              className="w-full p-4 text-left hover:bg-gray-700/50 transition-colors duration-150 flex items-center text-gray-400 hover:text-white border-t border-gray-600/20"
            >
              <Plus className="w-4 h-4 mr-3" />
              Create New Profile
            </button>
          </div>
        )}
      </div>

      {/* Profile Action Buttons */}
      {selectedProfile && (
        <div className="flex items-center gap-2">
          <button
            onClick={onEditProfile}
            className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-xl border border-gray-700/20 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={onDeleteProfile}
            className="flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 backdrop-blur-sm border border-red-800/30 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
