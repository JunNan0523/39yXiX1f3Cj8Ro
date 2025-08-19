"use client";
import { Link, Calendar, FileText, Users } from "lucide-react";

export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: "posts", name: "Posts", icon: FileText },
    { id: "calendar", name: "Calendar", icon: Calendar },
    { id: "connection", name: "Connection", icon: Link },
    { id: "teams", name: "Teams", icon: Users },
  ];

  return (
    <div className="border-b border-gray-700 mb-8">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
