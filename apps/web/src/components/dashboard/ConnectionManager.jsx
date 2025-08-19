"use client";
import { Loader, ExternalLink, CheckCircle, XCircle } from "lucide-react";

const platforms = [
  {
    key: "twitter",
    name: "Twitter/X",
    icon: (
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
  },
  {
    key: "instagram",
    name: "Instagram",
    icon: (
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
  },
  {
    key: "youtube",
    name: "YouTube",
    icon: (
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
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    icon: (
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
  },
  {
    key: "tiktok",
    name: "TikTok",
    icon: (
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
  },
  {
    key: "threads",
    name: "Threads",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 192 192"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
      </svg>
    ),
  },
];

const PlatformCard = ({
  platform,
  accountInfo,
  isConnecting,
  disconnectingAccount,
  onConnect,
  onDisconnect,
}) => {
  const isConnected = !!accountInfo;
  const isDisconnecting = disconnectingAccount === accountInfo?.id;

  return (
    <div className="group relative bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600 rounded-lg p-6 hover:shadow-xl hover:border-gray-500 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gray-900 shadow-lg border border-gray-700">
            <span className="text-2xl">{platform.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-xl">{platform.name}</h3>
            {isConnected ? (
              <p className="text-gray-400 font-medium">
                @{accountInfo.username}
              </p>
            ) : (
              <p className="text-gray-500">Not connected</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <div className="flex items-center bg-green-900/20 text-green-400 px-4 py-2 rounded-lg border border-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold">Connected</span>
              </div>
              {isDisconnecting ? (
                <div className="flex items-center text-orange-400 bg-orange-900/20 px-4 py-2 rounded-lg border border-orange-800">
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  <span className="text-sm font-semibold">
                    Disconnecting...
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => onDisconnect(accountInfo)}
                  className="flex items-center px-4 py-2 text-sm bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors font-semibold border border-red-800"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Disconnect
                </button>
              )}
            </>
          ) : isConnecting ? (
            <div className="flex items-center text-blue-400 bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-800">
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              <span className="text-sm font-semibold">Connecting...</span>
            </div>
          ) : (
            <button
              onClick={() => onConnect(platform.key)}
              className="flex items-center px-6 py-3 text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ConnectionManager({
  selectedProfile,
  accounts,
  accountsLoading,
  handleConnectPlatform,
  handleDisconnectAccount,
  connectingPlatform,
  disconnectingAccount,
}) {
  if (!selectedProfile) return null;

  const getAccountInfo = (platformKey) => {
    return accounts.find(
      (account) => account.platform === platformKey && account.is_active,
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Social Media Connections
        </h2>
        <p className="text-gray-400 text-lg">
          Connect your social media accounts for {selectedProfile.name}
        </p>
      </div>

      {accountsLoading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-0"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-75"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-150"></div>
            </div>
            <p className="text-gray-400 text-sm mt-3">Loading connections...</p>

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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.key}
              platform={platform}
              accountInfo={getAccountInfo(platform.key)}
              isConnecting={connectingPlatform === platform.key}
              disconnectingAccount={disconnectingAccount}
              onConnect={handleConnectPlatform}
              onDisconnect={handleDisconnectAccount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
