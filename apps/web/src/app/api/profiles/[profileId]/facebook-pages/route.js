import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

const GETLATE_API_KEY = process.env.GETLATE_API_KEY;
const GETLATE_BASE_URL = "https://getlate.dev/api";

/**
 * Facebook Pages API - API-Only Flow
 *
 * Implements the API-only approach recommended by getlate.dev team:
 * - GET: Uses user access token to fetch pages from getlate.dev API
 * - POST: Uses user access token to connect selected page via getlate.dev API
 *
 * This bypasses getlate.dev's hosted UI and avoids "Unauthorized" errors
 */

// GET: Fetch available Facebook pages for selection (API-only flow)
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = params;
    const userId = session.user.id;
    const url = new URL(request.url);

    // Extract the user access token (tempToken) from the API-only flow
    const tempToken = url.searchParams.get("tempToken");
    const tokenType = url.searchParams.get("tokenType");
    const flow = url.searchParams.get("flow");

    console.log("=== Facebook Pages GET Request (API-Only) ===");
    console.log("Parameters:", {
      profileId,
      userId,
      hasToken: !!tempToken,
      tokenLength: tempToken ? tempToken.length : 0,
      tokenType,
      flow,
      allParams: Object.fromEntries(url.searchParams.entries()),
    });

    if (!tempToken) {
      console.error("Facebook pages request missing user access token");
      console.error(
        "Available parameters:",
        Object.fromEntries(url.searchParams.entries()),
      );

      return Response.json(
        {
          error: "User access token is required for Facebook page selection",
          details: "No tempToken found in parameters",
          troubleshooting: [
            "Make sure you completed the Facebook OAuth flow",
            "The API-only flow should provide a user access token",
            "Try disconnecting and reconnecting your Facebook account",
          ],
        },
        { status: 400 },
      );
    }

    // Verify profile belongs to user
    const profile = await sql`
      SELECT id, getlate_profile_id FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (profile.length === 0) {
      console.error("Profile not found:", { profileId, userId });
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile[0].getlate_profile_id) {
      console.error("Profile missing getlate_profile_id:", {
        profileId,
        profile: profile[0],
      });
      return Response.json(
        {
          error: "Profile not properly synced with getlate.dev",
          details: "Profile is missing getlate_profile_id",
        },
        { status: 400 },
      );
    }

    // Call getlate.dev API-only endpoint to fetch Facebook pages
    const apiUrl = new URL(
      `${GETLATE_BASE_URL}/v1/connect/facebook/select-page`,
    );
    apiUrl.searchParams.set("profileId", profile[0].getlate_profile_id);
    apiUrl.searchParams.set("tempToken", tempToken);

    console.log("Calling getlate.dev API-only endpoint:", {
      url: apiUrl.toString(),
      profileId: profile[0].getlate_profile_id,
      hasApiKey: !!GETLATE_API_KEY,
      tokenLength: tempToken.length,
      endpoint: "GET /v1/connect/facebook/select-page (API-only)",
      flow: "API-only (bypasses hosted UI)",
    });

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GETLATE_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "SocialElf/1.0",
        Accept: "application/json",
      },
    });

    console.log("Getlate.dev API-only response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to fetch Facebook pages from getlate.dev (API-only):",
        {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          apiUrl: apiUrl.toString(),
          profileId: profile[0].getlate_profile_id,
        },
      );

      // Parse error response for better user feedback
      let errorMessage = "Failed to fetch Facebook pages";
      let troubleshooting = [
        "Make sure you have admin access to Facebook Business pages",
        "Ensure pages are Business pages, not personal profiles",
        "Try reconnecting your Facebook account with proper permissions",
      ];

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = `Facebook API Error: ${errorData.error}`;
        }
        if (errorData.error_description) {
          errorMessage += ` - ${errorData.error_description}`;
        }
        if (errorData.troubleshooting) {
          troubleshooting = errorData.troubleshooting;
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
        errorMessage += ` (HTTP ${response.status})`;
      }

      // Handle specific error codes
      if (response.status === 401) {
        errorMessage =
          "Facebook authentication failed or expired. Please try connecting again.";
        troubleshooting = [
          "The Facebook user access token has expired or is invalid",
          "Try starting the Facebook connection process again",
          "Make sure you granted all required permissions during Facebook OAuth",
        ];
      } else if (response.status === 403) {
        errorMessage =
          "Access denied to Facebook pages. Check your permissions.";
        troubleshooting = [
          "Make sure you have admin access to Facebook Business pages",
          "Verify that pages are Business pages, not personal profiles",
          "Check if your Facebook account has proper page management permissions",
        ];
      }

      return Response.json(
        {
          error: errorMessage,
          troubleshooting,
          status: response.status,
          flow: "API-only",
          debugInfo: {
            hasToken: !!tempToken,
            tokenLength: tempToken ? tempToken.length : 0,
            profileId: profile[0].getlate_profile_id,
            apiEndpoint: "GET /v1/connect/facebook/select-page",
          },
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("Facebook pages response from getlate.dev (API-only):", {
      pagesCount: data.pages ? data.pages.length : 0,
      pages: data.pages
        ? data.pages.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            hasAccessToken: !!p.access_token,
            tasks: p.tasks,
          }))
        : [],
      hasPages: !!(data.pages && data.pages.length > 0),
      flow: "API-only",
    });

    // Validate that we have pages
    if (!data.pages || data.pages.length === 0) {
      return Response.json({
        pages: [],
        profileId,
        tempToken: tempToken, // Pass back the token for use in POST request
        flow: "API-only",
        message: "No Facebook pages found",
        troubleshooting: [
          "Make sure you have admin access to at least one Facebook Business page",
          "Personal Facebook profiles cannot be used for posting",
          "Check if your Facebook pages are properly configured as Business pages",
          "Verify you completed the Facebook authorization with page permissions",
        ],
      });
    }

    return Response.json({
      pages: data.pages || [],
      profileId,
      tempToken: tempToken, // Pass back the token for use in POST request
      flow: "API-only",
      debugInfo: {
        profileId: profile[0].getlate_profile_id,
        pagesFound: data.pages ? data.pages.length : 0,
        endpoint: "GET /v1/connect/facebook/select-page (API-only)",
        bypassedHostedUI: true,
      },
    });
  } catch (error) {
    console.error("Error fetching Facebook pages (API-only):", error);
    return Response.json(
      {
        error: "Failed to fetch Facebook pages",
        details: error.message,
        flow: "API-only",
        troubleshooting: [
          "Check your internet connection",
          "Try again in a few minutes",
          "Contact support if the problem persists",
        ],
      },
      { status: 500 },
    );
  }
}

// POST: Connect a selected Facebook page (API-only flow)
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = params;
    const userId = session.user.id;
    const body = await request.json();
    const { tempToken, pageId, flow } = body;

    // Debug logging
    console.log("=== Facebook Pages POST Request (API-Only) ===");
    console.log("Parameters:", {
      profileId,
      userId,
      hasToken: !!tempToken,
      tokenLength: tempToken ? tempToken.length : 0,
      pageId,
      flow,
    });

    if (!tempToken || !pageId) {
      console.error(
        "Facebook page connection request missing required parameters:",
        {
          hasToken: !!tempToken,
          hasPageId: !!pageId,
        },
      );
      return Response.json(
        {
          error: "User access token and page selection are required",
          details: "Missing tempToken or pageId parameters",
          troubleshooting: [
            "Make sure you selected a Facebook page",
            "Try starting the connection process again",
            "Check that your Facebook authentication is still valid",
          ],
        },
        { status: 400 },
      );
    }

    // Verify profile belongs to user
    const profile = await sql`
      SELECT id, getlate_profile_id FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (profile.length === 0) {
      console.error("Profile not found for Facebook connection:", {
        profileId,
        userId,
      });
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile[0].getlate_profile_id) {
      console.error(
        "Profile missing getlate_profile_id for Facebook connection:",
        {
          profileId,
        },
      );
      return Response.json(
        {
          error: "Profile not properly synced with getlate.dev",
          details: "Profile is missing getlate_profile_id",
        },
        { status: 400 },
      );
    }

    // Build request to getlate.dev API-only endpoint
    const apiUrl = new URL(
      `${GETLATE_BASE_URL}/v1/connect/facebook/select-page`,
    );

    const requestBody = {
      profileId: profile[0].getlate_profile_id,
      pageId,
      tempToken,
      userProfile: {
        id: session.user.id,
        name: session.user.name || "Unknown User",
        profilePicture: session.user.image,
      },
    };

    console.log("Connecting Facebook page via getlate.dev (API-only):", {
      url: apiUrl.toString(),
      profileId: profile[0].getlate_profile_id,
      pageId,
      hasToken: !!tempToken,
      tokenLength: tempToken.length,
      userProfile: requestBody.userProfile,
      endpoint: "POST /v1/connect/facebook/select-page (API-only)",
      flow: "API-only (bypasses hosted UI)",
    });

    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GETLATE_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "SocialElf/1.0",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Facebook page connection response (API-only):", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to connect Facebook page via getlate.dev (API-only):",
        {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          requestBody: {
            ...requestBody,
            tempToken: "[REDACTED]",
          },
        },
      );

      // Parse error response for better error messaging
      let errorMessage = "Failed to connect Facebook page";
      let troubleshooting = [
        "Make sure you have admin access to the selected Facebook page",
        "Verify the page is a Business page, not a personal profile",
        "Try disconnecting and reconnecting your Facebook account",
      ];

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = `Facebook Connection Error: ${errorData.error}`;
        }
        if (errorData.error_description) {
          errorMessage += ` - ${errorData.error_description}`;
        }
        if (errorData.troubleshooting) {
          troubleshooting = errorData.troubleshooting;
        }
      } catch (parseError) {
        console.error(
          "Could not parse Facebook connection error response:",
          parseError,
        );
      }

      return Response.json(
        {
          error: errorMessage,
          troubleshooting,
          status: response.status,
          flow: "API-only",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("Facebook page connection successful (API-only):", {
      success: data.success,
      account: data.account
        ? {
            platform: data.account.platform,
            username: data.account.username,
            displayName: data.account.displayName,
            isActive: data.account.isActive,
          }
        : null,
      message: data.message,
      flow: "API-only",
    });

    return Response.json({
      success: true,
      message: data.message || "Facebook page connected successfully",
      account: data.account,
      profileId,
      flow: "API-only",
      debugInfo: {
        profileId: profile[0].getlate_profile_id,
        pageId,
        endpoint: "POST /v1/connect/facebook/select-page (API-only)",
        bypassedHostedUI: true,
      },
    });
  } catch (error) {
    console.error("Error connecting Facebook page (API-only):", error);
    return Response.json(
      {
        error: "Failed to connect Facebook page",
        details: error.message,
        flow: "API-only",
        troubleshooting: [
          "Check your internet connection",
          "Try again in a few minutes",
          "Contact support if the problem persists",
        ],
      },
      { status: 500 },
    );
  }
}
