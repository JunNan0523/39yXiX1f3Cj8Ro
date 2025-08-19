export default function ConnectSuccessPage({ params, searchParams }) {
  const { profileId } = params;
  const { platform, username, connected } = searchParams;

  const platformName = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "Account";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/20 py-8 px-4 shadow-2xl rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-lg bg-green-900/20">
              <svg
                className="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="mt-6 text-center text-3xl font-bold text-white">
              Connected
            </h2>

            <p className="mt-4 text-sm text-gray-400 max-w-sm">
              Successfully connected your {platformName} account
              {username ? ` @${username}` : ""}.
            </p>

            {platform && (
              <p className="mt-2 text-xs text-gray-500">
                Platform: {platformName}
              </p>
            )}
          </div>

          <div className="mt-8">
            <a
              href="/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
