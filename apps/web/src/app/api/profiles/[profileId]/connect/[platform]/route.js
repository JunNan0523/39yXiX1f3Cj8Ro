import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

const GETLATE_API_KEY = process.env.GETLATE_API_KEY;
const GETLATE_BASE_URL = "https://getlate.dev/api";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId, platform } = params;
    const userId = session.user.id;

    // Debug: Check if API key is available
    if (!GETLATE_API_KEY) {
      console.error("GETLATE_API_KEY environment variable is not set");
      return Response.json(
        {
          error: "API configuration error. Please check environment variables.",
        },
        { status: 500 },
      );
    }

    // Get the correct base URL for redirects - prioritize NEXTAUTH_URL, then use the production domain we know works
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://socialelf.created.app" // Use the domain from the screenshot
        : "http://localhost:3000");

    // Debug: Log environment variables and base URL
    console.log("Environment debug:", {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      baseUrl: baseUrl,
    });

    if (!process.env.NEXTAUTH_URL) {
      console.warn("NEXTAUTH_URL not set, using default:", baseUrl);
    }

    // Verify profile belongs to user and get getlate profile ID
    const profile = await sql`
      SELECT id, getlate_profile_id FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (profile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile[0].getlate_profile_id) {
      return Response.json(
        {
          error: "Profile not synced with getlate.dev. Please try again.",
        },
        { status: 400 },
      );
    }

    const supportedPlatforms = [
      "twitter",
      "instagram",
      "facebook",
      "youtube",
      "linkedin",
      "tiktok",
      "threads",
    ];
    if (!supportedPlatforms.includes(platform)) {
      return Response.json(
        {
          error: "Unsupported platform",
        },
        { status: 400 },
      );
    }

    // Facebook now uses API-only flow as recommended by getlate.dev team
    if (platform === "facebook") {
      return await handleFacebookApiOnlyConnection(
        profileId,
        profile[0].getlate_profile_id,
        baseUrl,
      );
    }

    // Regular connection flow for other platforms
    const redirectUrl = `${baseUrl}/api/profiles/${profileId}/connect/${platform}/callback`;
    const apiUrl = new URL(`${GETLATE_BASE_URL}/v1/connect/${platform}`);
    apiUrl.searchParams.set("profileId", profile[0].getlate_profile_id);
    apiUrl.searchParams.set("redirect_url", redirectUrl);

    // Debug: Log the request details
    console.log("Calling getlate.dev connect API:", {
      url: apiUrl.toString(),
      method: "GET",
      headers: {
        Authorization: `Bearer ${GETLATE_API_KEY ? "[REDACTED]" : "MISSING"}`,
      },
      profileId: profile[0].getlate_profile_id,
      redirectUrl,
      hasApiKey: !!GETLATE_API_KEY,
    });

    // Get the connection URL from getlate.dev
    try {
      const connectResponse = await fetch(apiUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${GETLATE_API_KEY}`,
        },
      });

      console.log("Getlate.dev response status:", connectResponse.status);
      console.log(
        "Getlate.dev response headers:",
        Object.fromEntries(connectResponse.headers.entries()),
      );

      if (!connectResponse.ok) {
        const errorText = await connectResponse.text();
        console.error(
          "Getlate.dev connect API error:",
          connectResponse.status,
          errorText,
        );

        // Check for Twitter BYOK (Bring Your Own Key) error
        if (connectResponse.status === 403) {
          try {
            const errorData = JSON.parse(errorText);
            if (
              errorData.requiresByok ||
              (errorData.error && errorData.error.includes("BYOK"))
            ) {
              console.log(
                "Twitter BYOK error detected, redirecting to BYOK page",
              );
              return Response.json({
                authUrl: `${process.env.NEXTAUTH_URL || "https://socialelf.created.app"}/dashboard/profiles/${profileId}/byok-required?platform=${platform}`,
                requiresByok: true,
                platform,
                profileId,
              });
            }
          } catch (parseError) {
            console.error(
              "Failed to parse error response for BYOK check:",
              parseError,
            );
          }
        }

        return Response.json(
          {
            error: `Failed to initiate ${platform} connection: ${errorText}`,
          },
          { status: connectResponse.status },
        );
      }

      const connectData = await connectResponse.json();

      // Debug: Log the response
      console.log("Getlate.dev response:", connectData);

      // Extract authUrl from response
      const authUrl = connectData?.authUrl;
      if (!authUrl) {
        console.error("No authUrl in getlate.dev response:", connectData);
        return Response.json(
          {
            error: "Invalid response from getlate.dev API",
          },
          { status: 500 },
        );
      }

      return Response.json({
        authUrl,
        platform,
        profileId,
        state: connectData?.state,
      });
    } catch (error) {
      console.error("Error calling getlate.dev connect API:", error);
      return Response.json(
        { error: "Failed to connect to getlate.dev API" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error initiating platform connection:", error);
    return Response.json(
      { error: "Failed to initiate connection" },
      { status: 500 },
    );
  }
}

/**
 * API-Only Facebook Connection Flow (recommended by getlate.dev team)
 *
 * This approach:
 * 1. Uses our own Facebook OAuth with proper scopes
 * 2. Calls getlate.dev API directly (bypasses their hosted UI)
 * 3. Avoids "Unauthorized" error from Late session requirement
 *
 * Required Facebook scopes:
 * - pages_show_list
 * - pages_read_engagement
 * - pages_manage_posts
 */
async function handleFacebookApiOnlyConnection(
  profileId,
  getlateProfileId,
  baseUrl,
) {
  try {
    console.log("=== Facebook API-Only Connection Flow ===");

    // Facebook App credentials (these need to be set in environment variables)
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      console.error("Missing Facebook app credentials");
      return Response.json(
        {
          error:
            "Facebook app not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables.",
          setupInstructions: [
            "1. Go to https://developers.facebook.com/",
            "2. Create or select your Facebook App",
            "3. Add Facebook Login product",
            "4. Set environment variables: FACEBOOK_APP_ID and FACEBOOK_APP_SECRET",
          ],
        },
        { status: 500 },
      );
    }

    // Use the correct base URL
    let correctBaseUrl = process.env.NEXTAUTH_URL;
    if (!correctBaseUrl) {
      correctBaseUrl =
        process.env.NODE_ENV === "production"
          ? "https://socialelf.created.app"
          : "http://localhost:3000";
    }

    // Our callback will handle the Facebook OAuth response and get pages
    const redirectUri = `${correctBaseUrl}/api/profiles/${profileId}/connect/facebook/callback`;

    // Facebook OAuth URL with required scopes for page management
    const requiredScopes = [
      "pages_show_list", // List user's pages
      "pages_read_engagement", // Read page insights
      "pages_manage_posts", // Manage page posts
    ].join(",");

    const facebookAuthUrl = new URL(
      "https://www.facebook.com/v18.0/dialog/oauth",
    );
    facebookAuthUrl.searchParams.set("client_id", FACEBOOK_APP_ID);
    facebookAuthUrl.searchParams.set("redirect_uri", redirectUri);
    facebookAuthUrl.searchParams.set("scope", requiredScopes);
    facebookAuthUrl.searchParams.set("response_type", "code");
    facebookAuthUrl.searchParams.set(
      "state",
      `profileId=${profileId}&getlateProfileId=${getlateProfileId}`,
    );

    console.log("Facebook API-Only OAuth details:", {
      profileId,
      getlateProfileId,
      redirectUri,
      authUrl: facebookAuthUrl.toString(),
      scopes: requiredScopes,
      flow: "API-Only (bypasses getlate.dev hosted UI)",
      appId: FACEBOOK_APP_ID,
      baseUrl: correctBaseUrl,
    });

    return Response.json({
      authUrl: facebookAuthUrl.toString(),
      platform: "facebook",
      profileId,
      flow: "api-only",
      scopes: requiredScopes.split(","),
      redirectUri,
      debugInfo: {
        getlateProfileId,
        baseUrl: correctBaseUrl,
        approach: "Direct Facebook OAuth → Our API → getlate.dev API",
        bypassesGetlateHostedUI: true,
        avoids: "Unauthorized error from Late session requirement",
      },
    });
  } catch (error) {
    console.error("Error in Facebook API-only connection flow:", error);
    return Response.json(
      {
        error: "Failed to initiate Facebook API-only connection",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
