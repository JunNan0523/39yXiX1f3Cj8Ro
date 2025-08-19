"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { ArrowLeft, Facebook, AlertCircle, Info, CheckCircle, Copy } from "lucide-react";

export default function FacebookFlowDebugPage() {
  const { data: user, loading } = useUser();
  const [debugInfo, setDebugInfo] = useState({
    url: "",
    params: {},
    fragments: {},
    referrer: "",
    userAgent: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const urlObj = new URL(url);
      const params = Object.fromEntries(urlObj.searchParams.entries());
      
      // Try to parse URL fragment
      let fragments = {};
      if (window.location.hash) {
        const fragmentString = window.location.hash.substring(1);
        const fragmentParams = new URLSearchParams(fragmentString);
        fragments = Object.fromEntries(fragmentParams.entries());
      }

      setDebugInfo({
        url,
        params,
        fragments,
        referrer: document.referrer || "No referrer",
        userAgent: navigator.userAgent,
      });

      console.log("Facebook Flow Debug Info:", {
        url,
        params,
        fragments,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      });
    }
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleGoBack = () => {
    window.location.href = "/dashboard";
  };

  const handleTestFacebookConnection = () => {
    // Navigate to profile 5 (or any profile) for testing
    window.location.href = "/dashboard/profiles/5";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
              <Facebook className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Facebook Flow Debug
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Info className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Authenticated</label>
                <div className="flex items-center mt-1">
                  {user ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className={user ? "text-green-600" : "text-red-600"}>
                    {user ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              {user && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900">{user.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* URL Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Info className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Current URL Information</h2>
              </div>
              <button
                onClick={() => copyToClipboard(debugInfo.url)}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy URL
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full URL</label>
                <p className="mt-1 text-sm text-gray-900 break-all bg-gray-50 p-2 rounded">
                  {debugInfo.url}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Referrer</label>
                <p className="mt-1 text-sm text-gray-900 break-all">
                  {debugInfo.referrer}
                </p>
              </div>
            </div>
          </div>

          {/* URL Parameters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Info className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">URL Parameters (Query String)</h2>
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(debugInfo.params, null, 2))}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy JSON
              </button>
            </div>
            <div className="space-y-2">
              {Object.keys(debugInfo.params).length > 0 ? (
                Object.entries(debugInfo.params).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="font-medium text-gray-700">{key}</div>
                    <div className="md:col-span-2 text-sm text-gray-900 break-all bg-gray-50 p-2 rounded">
                      {value}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No URL parameters found</p>
              )}
            </div>
          </div>

          {/* URL Fragments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Info className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">URL Fragments (Hash)</h2>
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(debugInfo.fragments, null, 2))}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy JSON
              </button>
            </div>
            <div className="space-y-2">
              {Object.keys(debugInfo.fragments).length > 0 ? (
                Object.entries(debugInfo.fragments).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="font-medium text-gray-700">{key}</div>
                    <div className="md:col-span-2 text-sm text-gray-900 break-all bg-gray-50 p-2 rounded">
                      {value}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No URL fragments found</p>
              )}
            </div>
          </div>

          {/* Expected Facebook Parameters */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Facebook className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-blue-900">Expected Facebook Parameters</h2>
            </div>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>For successful Facebook OAuth:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>code</code> - Authorization code from Facebook</li>
                <li><code>state</code> - State parameter for security</li>
                <li><code>tempToken</code> - Temporary access token (alternative to code)</li>
              </ul>
              
              <p className="mt-4"><strong>For Facebook page selection:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>tempToken</code> - Required for fetching pages</li>
                <li><code>profileId</code> - getlate.dev profile ID</li>
              </ul>
              
              <p className="mt-4"><strong>For errors:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>error</code> - Error code</li>
                <li><code>error_description</code> - Human-readable error description</li>
              </ul>
            </div>
          </div>

          {/* Debug Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Info className="h-6 w-6 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Debug Actions</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={handleTestFacebookConnection}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Test Facebook Connection Flow
              </button>
              <div className="text-sm text-gray-600">
                <p>This will take you to a profile page where you can test the Facebook connection flow.</p>
              </div>
            </div>
          </div>

          {/* Browser Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Info className="h-6 w-6 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Browser Information</h2>
            </div>
            <div className="text-sm text-gray-700 break-all">
              <strong>User Agent:</strong> {debugInfo.userAgent}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}