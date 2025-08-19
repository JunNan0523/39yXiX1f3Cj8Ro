"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Facebook,
  AlertCircle,
  Info,
  CheckCircle,
  Copy,
  ExternalLink,
} from "lucide-react";

export default function CallbackDebug() {
  const [urlData, setUrlData] = useState({
    fullUrl: "",
    params: {},
    fragments: {},
    hash: "",
    parsedState: null,
  });

  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const params = {};

      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Parse URL fragments
      let fragments = {};
      if (window.location.hash) {
        const fragmentString = window.location.hash.substring(1);
        const fragmentParams = new URLSearchParams(fragmentString);
        fragmentParams.forEach((value, key) => {
          fragments[key] = value;
        });
      }

      // Try to parse state parameter
      let parsedState = null;
      const state = params.state || fragments.state;
      if (state) {
        try {
          const stateDecoded = decodeURIComponent(state);
          const stateParts = stateDecoded.split("-");
          if (stateParts.length >= 3) {
            parsedState = {
              raw: state,
              decoded: stateDecoded,
              parts: stateParts,
              profileId: stateParts[0],
              getlateProfileId: stateParts[1],
              timestamp: stateParts[2],
              redirectUrl: stateParts.slice(3).join("-"),
            };
          }
        } catch (e) {
          console.log("Could not parse state parameter:", e);
        }
      }

      const newUrlData = {
        fullUrl: window.location.href,
        params,
        fragments,
        hash: window.location.hash,
        parsedState,
      };

      setUrlData(newUrlData);

      // Generate suggested actions based on parameters
      const suggestedActions = [];

      // Check for authentication tokens
      if (params.tempToken || fragments.access_token || params.code) {
        const token = params.tempToken || fragments.access_token || params.code;
        const profileId =
          parsedState?.profileId || params.profileId || "UNKNOWN";

        suggestedActions.push({
          type: "redirect",
          title: "Redirect to Facebook Page Selection",
          description:
            "Authentication token found. Redirect to page selection.",
          url: `/dashboard/profiles/${profileId}/facebook-page-select?tempToken=${encodeURIComponent(token)}&state=${encodeURIComponent(state || "")}`,
          params: {
            tokenType: token === params.code ? "code" : "tempToken",
            profileId,
          },
        });
      }

      // Check for successful connection
      if (params.connected && params.username) {
        const profileId =
          parsedState?.profileId || params.profileId || "UNKNOWN";
        suggestedActions.push({
          type: "success",
          title: "Redirect to Success Page",
          description: "Connection completed successfully.",
          url: `/dashboard/profiles/${profileId}/connect-success?platform=${params.connected}&username=${encodeURIComponent(params.username)}&connected=true`,
          params: { platform: params.connected, username: params.username },
        });
      }

      // Check for errors
      if (params.error || fragments.error) {
        const error = params.error || fragments.error;
        const profileId =
          parsedState?.profileId || params.profileId || "UNKNOWN";
        suggestedActions.push({
          type: "error",
          title: "Redirect to Error Page",
          description: "Connection failed with error.",
          url: `/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(params.error_description || "")}`,
          params: { error, errorDescription: params.error_description },
        });
      }

      // If unclear what to do
      if (
        suggestedActions.length === 0 &&
        (state || Object.keys(params).length > 0)
      ) {
        suggestedActions.push({
          type: "investigate",
          title: "Continue with Manual Investigation",
          description: "Parameters found but unclear next steps.",
          url: `/debug/facebook-flow?${new URLSearchParams(params).toString()}`,
          params: { reason: "unclear_callback_params" },
        });
      }

      setActions(suggestedActions);
    }
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleGoBack = () => {
    window.location.href = "/dashboard";
  };

  const handleAction = (action) => {
    window.location.href = action.url;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </button>
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-orange-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                OAuth Callback Debug
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Suggested Actions */}
          {actions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Suggested Actions
                </h2>
              </div>
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {action.description}
                        </p>
                        {action.params && (
                          <div className="mt-2 text-xs text-gray-500">
                            <strong>Parameters:</strong>{" "}
                            {JSON.stringify(action.params)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleAction(action)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm ml-4"
                      >
                        Execute
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Info className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Full URL
                </h2>
              </div>
              <button
                onClick={() => copyToClipboard(urlData.fullUrl)}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </button>
            </div>
            <p className="bg-gray-50 p-3 rounded border break-all text-sm">
              {urlData.fullUrl || "Loading..."}
            </p>
          </div>

          {/* Parsed State */}
          {urlData.parsedState && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Facebook className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Parsed State Information
                  </h2>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(urlData.parsedState, null, 2),
                    )
                  }
                  className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy JSON
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profile ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {urlData.parsedState.profileId || "Not found"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Getlate Profile ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {urlData.parsedState.getlateProfileId || "Not found"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Timestamp
                  </label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {urlData.parsedState.timestamp || "Not found"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Redirect URL
                  </label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded break-all">
                    {urlData.parsedState.redirectUrl || "Not found"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Info className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  URL Parameters
                </h2>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(urlData.params, null, 2))
                }
                className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy JSON
              </button>
            </div>
            <div className="space-y-2">
              {Object.keys(urlData.params).length > 0 ? (
                Object.entries(urlData.params).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-2 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="font-medium text-blue-600">{key}</div>
                      <div className="md:col-span-2 text-sm text-gray-800 break-all">
                        {value}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No URL parameters found</p>
              )}
            </div>
          </div>

          {/* URL Fragments */}
          {Object.keys(urlData.fragments).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Info className="h-6 w-6 text-purple-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    URL Fragments (Hash)
                  </h2>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(urlData.fragments, null, 2))
                  }
                  className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy JSON
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(urlData.fragments).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-2 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="font-medium text-purple-600">{key}</div>
                      <div className="md:col-span-2 text-sm text-gray-800 break-all">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {urlData.hash && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Info className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Raw URL Hash
                </h2>
              </div>
              <p className="bg-gray-50 p-3 rounded border break-all text-sm">
                {urlData.hash}
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Instructions for Facebook Callback Issues:
            </h3>
            <div className="text-yellow-700 space-y-2">
              <p>
                If you're seeing a Facebook connection error, you can manually
                redirect by copying the problematic URL and changing the domain
                to use this debug page.
              </p>
              <p>
                <strong>Example:</strong>
                <br />
                Change:{" "}
                <code className="bg-yellow-100 px-1 rounded text-xs">
                  https://getlate.dev/connect/facebook/select-page?...
                </code>
                <br />
                To:{" "}
                <code className="bg-yellow-100 px-1 rounded text-xs">
                  https://socialelf.created.app/debug/callback?...
                </code>
              </p>
              <p className="text-sm mt-3">
                This debug page will parse the parameters and suggest the
                correct next action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
