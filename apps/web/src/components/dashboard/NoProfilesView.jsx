"use client";
import { User, Plus } from "lucide-react";

export default function NoProfilesView({ onCreateProfile }) {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-6">
        <User className="w-12 h-12 text-blue-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">No profiles yet</h3>
      <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
        Create your first profile to start managing your social media accounts and scheduling posts.
      </p>
      <button
        onClick={onCreateProfile}
        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
      >
        <Plus className="w-6 h-6 mr-3" />
        Create Your First Profile
      </button>
    </div>
  );
}
