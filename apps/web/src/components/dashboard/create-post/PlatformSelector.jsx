"use client";
import React from "react";
import { Plus, Link } from "lucide-react";

const platformIcons = {
  twitter: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  youtube: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  tiktok: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  threads: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 192 192"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 129.095 77.1544 124.409 76.6196 114.372C76.2232 106.93 81.9158 98.626 99.0812 97.6368C101.047 97.5234 102.976 97.468 104.871 97.468C111.106 97.468 116.939 98.0737 122.242 99.233C120.264 114.935 108.662 118.946 98.4405 129.507Z" />
    </svg>
  ),
};

export default function PlatformSelector({
  accounts,
  selectedPlatforms,
  onPlatformToggle,
  mediaItems = [],
  onGoToConnection,
}) {
  // Check if there are no connected accounts
  const hasNoConnectedAccounts = !accounts || accounts.length === 0;

  // If no connected accounts, show empty state
  if (hasNoConnectedAccounts) {
    return (
      <div className="mb-4">
        <div className="bg-gray-700/30 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <Link className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No Social Media Accounts Connected
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            You need to connect at least one social media account before you can
            create posts. Click the button below to connect your accounts.
          </p>
          <button
            type="button"
            onClick={onGoToConnection}
            className="flex items-center justify-center px-6 py-3 bg-blue-800/20 hover:bg-blue-800/30 border border-blue-600/50 hover:border-blue-500 text-blue-400 font-medium rounded-lg transition-all duration-200 mx-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Connect Social Media Account
          </button>
        </div>
      </div>
    );
  }

  const isPlatformSelected = (platform) => {
    return selectedPlatforms.some((p) => p.platform === platform);
  };

  // Check if platform requires media but none is provided
  const platformRequiresMedia = (platform) => {
    return ["instagram", "tiktok", "youtube"].includes(platform);
  };

  const hasMissingMedia = (platform) => {
    return (
      platformRequiresMedia(platform) &&
      isPlatformSelected(platform) &&
      (!mediaItems || mediaItems.length === 0)
    );
  };

  const getErrorMessage = (platform) => {
    if (hasMissingMedia(platform)) {
      if (platform === "youtube") {
        return "Missing video content";
      }
      return "Missing media content";
    }
    return null;
  };

  const hasAnyErrors = accounts.some((account) =>
    hasMissingMedia(account.platform),
  );

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
        {accounts.map((account) => {
          const hasError = hasMissingMedia(account.platform);
          const errorMessage = getErrorMessage(account.platform);

          return (
            <div key={account.id} className="relative">
              <label
                className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all min-h-[120px] ${
                  hasError
                    ? "border-red-500 bg-red-500/10"
                    : isPlatformSelected(account.platform)
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 hover:border-gray-500"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isPlatformSelected(account.platform)}
                  onChange={() =>
                    onPlatformToggle(account.platform, account.id)
                  }
                  className="sr-only"
                />
                <div className="flex items-center justify-center w-12 h-12 mb-3">
                  {platformIcons[account.platform] || (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {account.platform[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-white capitalize mb-1">
                    {account.platform}
                  </div>
                  <div className="text-xs text-gray-400">
                    @{account.username}
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Error messages section - separate from grid to prevent overlap */}
      {hasAnyErrors && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
          <div className="space-y-2">
            {accounts.map((account) => {
              const errorMessage = getErrorMessage(account.platform);
              if (!errorMessage) return null;

              return (
                <div key={account.id} className="flex items-center">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    {platformIcons[account.platform] && (
                      <div className="w-3 h-3 text-red-400">
                        {React.cloneElement(platformIcons[account.platform], {
                          width: "12",
                          height: "12",
                          fill: "currentColor",
                        })}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-red-400 font-medium">
                    {account.platform.charAt(0).toUpperCase() +
                      account.platform.slice(1)}
                    : {errorMessage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
