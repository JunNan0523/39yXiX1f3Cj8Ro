"use client";
import { useState, useRef, useEffect } from "react";
import { LogOut, Calendar, User, Settings, ChevronDown } from "lucide-react";

export default function DashboardHeader({ user, onSignOut }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    window.location.href = "/account/settings";
  };

  const handleSignOutClick = () => {
    setIsDropdownOpen(false);
    onSignOut();
  };

  return (
    <header className="backdrop-blur-xl bg-gray-900/80 shadow-lg border-b border-gray-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Social Scheduler
              </h1>
              <p className="text-sm text-gray-400">
                Manage your social media presence
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* User Info and Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                {/* User Avatar */}
                <div className="relative">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-gray-600"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center border border-gray-600">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* User Name */}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-white">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-400">Account</p>
                </div>

                {/* Dropdown Arrow */}
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-lg py-2 z-50">
                  {/* User Info in Dropdown */}
                  <div className="px-4 py-3 border-b border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border border-gray-600"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center border border-gray-600">
                          <User className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={handleSettingsClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOutClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
