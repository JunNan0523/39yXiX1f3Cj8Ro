import { TriangleAlert } from "lucide-react";

export default function ConnectErrorPage({ params, searchParams }) {
  const { profileId } = params;
  const { platform, error, error_description } = searchParams;

  let errorMessage =
    "Failed to connect account. This usually happens when the account is already connected to another profile.";

  // Handle specific error cases
  if (error === "access_denied") {
    errorMessage =
      "Connection was cancelled. You need to approve the connection to link your account.";
  } else if (error === "server_error") {
    errorMessage = "A server error occurred. Please try again later.";
  } else if (error_description) {
    errorMessage = `Connection failed: ${error_description}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/20 py-8 px-4 shadow-2xl rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-lg bg-red-900/20">
              <TriangleAlert className="h-6 w-6 text-red-400" />
            </div>

            <h2 className="mt-6 text-center text-3xl font-bold text-white">
              Connection Failed
            </h2>

            <p className="mt-4 text-sm text-gray-400 max-w-sm">
              {errorMessage}
            </p>

            {platform && (
              <p className="mt-2 text-xs text-gray-500">
                Platform: {platform.charAt(0).toUpperCase() + platform.slice(1)}
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
