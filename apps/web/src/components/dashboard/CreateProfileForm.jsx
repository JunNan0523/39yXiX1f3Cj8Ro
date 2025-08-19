"use client";
import { useState } from "react";
import { Plus, Save, X } from "lucide-react";

export default function CreateProfileForm({
  onCancel,
  onSuccess,
  error,
  isSubmitting,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#4ade80",
    is_default: false,
  });

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSuccess(formData);
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/20 rounded-lg p-8 mb-8 shadow-lg">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Plus className="w-6 h-6 mr-2" />
          Create New Profile
        </h3>
        <p className="text-gray-400">
          Add a new profile to manage your social media accounts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="e.g., Personal Brand, Company Account"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Describe this profile's purpose..."
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Color
          </label>
          <div className="flex flex-wrap gap-3 mb-3">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color }))}
                className={`w-10 h-10 rounded-full border-2 ${
                  formData.color === color
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
              style={{ backgroundColor: formData.color }}
            />
          </div>
        </div>

        {/* Set as Default Profile */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                is_default: !formData.is_default,
              })
            }
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors mr-3 ${
              formData.is_default
                ? "bg-blue-500/80 backdrop-blur-sm"
                : "bg-gray-700/80 backdrop-blur-sm"
            } border ${
              formData.is_default ? "border-blue-400/50" : "border-gray-600/50"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition-transform ${
                formData.is_default ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <label className="text-sm text-gray-300">
            Set as default profile
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="flex items-center px-6 py-3 bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-600/20 text-green-300 disabled:text-gray-400 border border-green-500/30 disabled:border-gray-600/30 backdrop-blur-sm font-semibold rounded-lg shadow-lg transition-all duration-200"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSubmitting ? "Creating..." : "Create Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
