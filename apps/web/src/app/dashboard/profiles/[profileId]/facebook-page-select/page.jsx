"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  ArrowLeft,
  Facebook,
  CheckCircle,
  Loader,
  AlertCircle,
} from "lucide-react";

export default function FacebookPageSelectPage() {
  const [profileId, setProfileId] = useState(null);
  const [tempToken, setTempToken] = useState(null);
  const [code, setCode] = useState(null);
  const [state, setState] = useState(null);
  const { data: user, loading } = useUser();

  // Get parameters from URL
  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split("/");
    const id = segments[segments.indexOf("profiles") + 1];
    setProfileId(id);

    const urlParams = new URLSearchParams(window.location.search);
    setTempToken(urlParams.get("tempToken"));
    setCode(urlParams.get("code")); // Handle code parameter from OAuth flow
    setState(urlParams.get("state"));

    // Debug log the parameters we received
    console.log("Facebook page select parameters:", {
      profileId: id,
      tempToken: urlParams.get("tempToken") ? "[PRESENT]" : null,
      code: urlParams.get("code") ? "[PRESENT]" : null,
      state: urlParams.get("state"),
      platform: urlParams.get("platform"),
    });
  }, []);

  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/account/signin";
    }
  }, [user, loading]);

  // Fetch Facebook pages
  useEffect(() => {
    const fetchPages = async () => {
      if (!profileId || (!tempToken && !code)) {
        console.warn(
          "Missing required parameters for Facebook page selection:",
          {
            profileId: !!profileId,
            tempToken: !!tempToken,
            code: !!code,
          },
        );
        return;
      }

      try {
        // Build the API URL with the appropriate token
        let apiUrl = `/api/profiles/${profileId}/facebook-pages`;
        const params = new URLSearchParams();

        if (tempToken) {
          params.set("tempToken", tempToken);
        } else if (code) {
          params.set("code", code);
          params.set("platform", "facebook");
        }

        if (state) {
          params.set("state", state);
        }

        const fullUrl = `${apiUrl}?${params.toString()}`;
        console.log("Fetching Facebook pages from:", fullUrl);

        const response = await fetch(fullUrl);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch Facebook pages");
        }

        const data = await response.json();
        console.log("Facebook pages response:", data);

        setPages(data.pages || []);

        // Auto-select first page if only one page available
        if (data.pages?.length === 1) {
          setSelectedPageId(data.pages[0].id);
        }
      } catch (error) {
        console.error("Error fetching Facebook pages:", error);
        setError(error.message);
      } finally {
        setPagesLoading(false);
      }
    };

    if (user && profileId && (tempToken || code)) {
      fetchPages();
    } else if (user && profileId && !tempToken && !code) {
      // Handle case where we don't have the required tokens
      setError(
        "Missing authentication token from Facebook. Please try connecting again.",
      );
      setPagesLoading(false);
    }
  }, [user, profileId, tempToken, code, state]);

  const handlePageSelect = (pageId) => {
    setSelectedPageId(pageId);
    setError(null);
  };

  const handleConnectPage = async () => {
    if (!selectedPageId || (!tempToken && !code)) {
      setError(
        "Please select a Facebook page to connect and ensure you have proper authentication.",
      );
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const requestBody = {
        pageId: selectedPageId,
        userProfile: {
          id: user.id,
          name: user.name,
          profilePicture: user.image,
        },
      };

      // Include the appropriate token
      if (tempToken) {
        requestBody.tempToken = tempToken;
      } else if (code) {
        requestBody.code = code;
        requestBody.platform = "facebook";
      }

      if (state) {
        requestBody.state = state;
      }

      console.log("Connecting Facebook page with data:", {
        profileId,
        pageId: selectedPageId,
        hasToken: !!(tempToken || code),
        tokenType: tempToken ? "tempToken" : code ? "code" : "none",
      });

      const response = await fetch(
        `/api/profiles/${profileId}/facebook-pages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to connect Facebook page");
      }

      const data = await response.json();
      console.log("Facebook page connected successfully:", data);

      setSuccess(true);

      // Redirect to profile page after success
      setTimeout(() => {
        window.location.href = `/dashboard/profiles/${profileId}?connected=true&platform=facebook&username=${encodeURIComponent(data.account?.username || data.account?.displayName || "Facebook Page")}`;
      }, 2000);
    } catch (error) {
      console.error("Error connecting Facebook page:", error);
      setError(error.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleBack = () => {
    window.location.href = `/dashboard/profiles/${profileId}`;
  };

  const handleRetryConnection = () => {
    window.location.href = `/dashboard/profiles/${profileId}`;
  };

  if (loading || !user || !profileId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error if no authentication token is available
  if (!tempToken && !code) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Profile
              </button>
              <div className="flex items-center">
                <Facebook className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Connect Facebook Page
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Missing authentication token from Facebook. This usually happens
              when the OAuth flow was interrupted or incomplete.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleRetryConnection}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Try Connecting Again
              </button>
              <p className="text-sm text-gray-500">
                If the problem persists, please ensure you have admin access to
                Facebook Business pages and that your Facebook app permissions
                are properly configured.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Profile
            </button>
            <div className="flex items-center">
              <Facebook className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Connect Facebook Page
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {success ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Facebook Page Connected Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Your Facebook page has been connected to your profile. You'll be
              redirected shortly.
            </p>
            <div className="flex justify-center">
              <Loader className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <Facebook className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Select Facebook Page
              </h2>
              <p className="text-gray-600">
                Choose which Facebook page you want to connect for posting
                content. Only Business pages can be used for social media
                posting.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Pages Loading */}
            {pagesLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Loading your Facebook pages...
                  </p>
                </div>
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Facebook Pages Found
                </h3>
                <p className="text-gray-600 mb-4">
                  You need to be an admin of at least one Facebook Business page
                  to use this feature.
                </p>
                <p className="text-sm text-gray-500">
                  Make sure you have administrator access to Facebook pages and
                  that they are Business pages.
                </p>
              </div>
            ) : (
              <>
                {/* Facebook Pages List */}
                <div className="space-y-3 mb-8">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPageId === page.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handlePageSelect(page.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Facebook className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {page.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {page.category}
                            </p>
                            {page.tasks && (
                              <p className="text-xs text-gray-500 mt-1">
                                Permissions: {page.tasks.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {selectedPageId === page.id ? (
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Connect Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleConnectPage}
                    disabled={!selectedPageId || connecting}
                    className={`px-8 py-3 rounded-md text-white font-medium transition-colors ${
                      !selectedPageId || connecting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {connecting ? (
                      <div className="flex items-center">
                        <Loader className="h-5 w-5 animate-spin mr-2" />
                        Connecting...
                      </div>
                    ) : (
                      "Connect Selected Page"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Important Notes:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Only Facebook Business pages can be connected for posting
                </li>
                <li>
                  • You must be an administrator of the page to connect it
                </li>
                <li>
                  • Posts will be published to the selected page, not your
                  personal profile
                </li>
                <li>
                  • You can change the connected page later through your profile
                  settings
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
