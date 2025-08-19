import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.redirect(`${process.env.NEXTAUTH_URL}/account/signin`);
    }

    const { profileId, platform } = params;
    const userId = session.user.id;
    const url = new URL(request.url);

    // Facebook API-only flow gets special treatment
    if (platform === "facebook") {
      return await handleFacebookApiOnlyCallback(request, params, session);
    }

    // Extract all possible parameters for other platforms
    const connected = url.searchParams.get("connected");
    const username = url.searchParams.get("username");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");
    const state = url.searchParams.get("state");

    // Enhanced debug logging - Log everything we receive
    console.log("=== OAuth callback received ===");
    console.log("URL:", request.url);
    console.log(
      "All URL Parameters:",
      Object.fromEntries(url.searchParams.entries()),
    );
    console.log("Parsed Parameters:", {
      profileId,
      platform,
      connected,
      username,
      error,
      errorDescription,
      state,
    });

    // Get the correct base URL for redirects
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://socialelf.created.app"
        : "http://localhost:3000");

    // Verify profile belongs to user
    const profile = await sql`
      SELECT id, getlate_profile_id FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (profile.length === 0) {
      console.error("Profile not found:", { profileId, userId });
      return Response.redirect(
        `${baseUrl}/dashboard/profiles/${profileId}/connect-error?error=profile_not_found&platform=${platform}`,
      );
    }

    console.log("Profile found:", {
      profileId: profile[0].id,
      getlateProfileId: profile[0].getlate_profile_id,
    });

    // Handle errors first
    if (error) {
      console.error("=== OAuth connection failed ===");
      console.error("Error details:", {
        error,
        errorDescription,
        platform,
        profileId,
        getlateProfileId: profile[0].getlate_profile_id,
        state,
      });

      const errorParams = new URLSearchParams({
        platform,
        error,
        ...(errorDescription && { error_description: errorDescription }),
      });

      return Response.redirect(
        `${baseUrl}/dashboard/profiles/${profileId}/connect-error?${errorParams.toString()}`,
      );
    }

    // Handle successful connection
    if (connected && username) {
      console.log("=== OAuth connection successful ===");
      console.log("Success details:", {
        profileId,
        userId,
        platform,
        username,
        connected,
        state,
      });

      const successParams = new URLSearchParams({
        platform,
        username,
        connected,
      });

      return Response.redirect(
        `${baseUrl}/dashboard/profiles/${profileId}/connect-success?${successParams.toString()}`,
      );
    }

    // If we reach here, we don't have clear success or error indicators
    console.warn("=== Unclear OAuth callback state ===");
    console.warn("Callback details:", {
      profileId,
      platform,
      hasConnected: !!connected,
      hasUsername: !!username,
      hasError: !!error,
      hasState: !!state,
      allParams: Object.fromEntries(url.searchParams.entries()),
    });

    // Check if we have any parameters at all
    const allParams = Object.fromEntries(url.searchParams.entries());
    if (Object.keys(allParams).length === 0) {
      console.error("No parameters received in OAuth callback");
      return Response.redirect(
        `${baseUrl}/dashboard/profiles/${profileId}/connect-error?error=no_parameters&platform=${platform}`,
      );
    }

    // For debugging purposes, redirect to a debug page with all parameters
    const debugParams = new URLSearchParams({
      platform,
      profileId,
      debugReason: "unclear_callback_state",
      allParams: JSON.stringify(allParams),
    });

    console.log(
      "Redirecting to debug page with params:",
      debugParams.toString(),
    );

    return Response.redirect(
      `${baseUrl}/debug/callback?${debugParams.toString()}`,
    );
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    const { profileId, platform } = params;

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://socialelf.created.app"
        : "http://localhost:3000");

    return Response.redirect(
      `${baseUrl}/dashboard/profiles/${profileId || "unknown"}/connect-error?error=callback_error&platform=${platform || "unknown"}`,
    );
  }
}

/**
 * Facebook API-Only Callback Handler
 *
 * Implements the API-only flow recommended by getlate.dev team:
 * 1. Exchange Facebook authorization code for user access token
 * 2. Redirect to our page selection interface with the token
 */
async function handleFacebookApiOnlyCallback(request, { params }, session) {
  const { profileId } = params;
  const userId = session.user.id;
  const url = new URL(request.url);

  // Facebook app credentials
  const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
  const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

  // Extract OAuth parameters
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  console.log("=== Facebook API-Only Callback ===");
  console.log("Parameters:", {
    profileId,
    userId,
    hasCode: !!code,
    codeLength: code ? code.length : 0,
    state,
    error,
    errorDescription,
    allParams: Object.fromEntries(url.searchParams.entries()),
  });

  const baseUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://socialelf.created.app"
      : "http://localhost:3000");

  // Check for Facebook OAuth errors
  if (error) {
    console.error("Facebook OAuth error:", { error, errorDescription });
    const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`;
    return Response.redirect(errorUrl);
  }

  if (!code) {
    console.error("Missing authorization code in Facebook callback");
    const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=missing_code&description=No authorization code received from Facebook`;
    return Response.redirect(errorUrl);
  }

  // Validate Facebook app configuration
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    console.error("Missing Facebook app credentials");
    const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=app_not_configured&description=Facebook app credentials not configured`;
    return Response.redirect(errorUrl);
  }

  // Parse state parameter to get getlateProfileId
  let getlateProfileId;
  try {
    const stateParams = new URLSearchParams(state);
    getlateProfileId = stateParams.get("getlateProfileId");

    if (!getlateProfileId) {
      throw new Error("Missing getlateProfileId in state");
    }
  } catch (stateError) {
    console.error("Invalid state parameter:", stateError);
    const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=invalid_state&description=${encodeURIComponent(stateError.message)}`;
    return Response.redirect(errorUrl);
  }

  // Verify profile belongs to user
  const profile = await sql`
    SELECT id, getlate_profile_id FROM profiles 
    WHERE id = ${profileId} AND user_id = ${userId}
  `;

  if (
    profile.length === 0 ||
    profile[0].getlate_profile_id !== getlateProfileId
  ) {
    console.error("Profile validation failed:", {
      profileExists: profile.length > 0,
      expectedGetlateId: getlateProfileId,
      actualGetlateId: profile[0]?.getlate_profile_id,
    });
    const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=profile_validation_failed&description=Profile not found or invalid`;
    return Response.redirect(errorUrl);
  }

  // Exchange authorization code for access token
  const redirectUri = `${baseUrl}/api/profiles/${profileId}/connect/facebook/callback`;

  console.log("Exchanging Facebook code for access token:", {
    codeLength: code.length,
    redirectUri,
    appId: FACEBOOK_APP_ID,
    hasSecret: !!FACEBOOK_APP_SECRET,
  });

  try {
    // Facebook token exchange
    const tokenUrl = "https://graph.facebook.com/v18.0/oauth/access_token";
    const tokenParams = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      redirect_uri: redirectUri,
      code: code,
    });

    const tokenResponse = await fetch(`${tokenUrl}?${tokenParams}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "SocialElf/1.0",
      },
    });

    console.log("Facebook token exchange response:", {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Facebook token exchange failed:", {
        status: tokenResponse.status,
        error: errorText,
      });

      const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=token_exchange_failed&description=${encodeURIComponent(`Token exchange failed: ${errorText}`)}`;
      return Response.redirect(errorUrl);
    }

    const tokenData = await tokenResponse.json();
    const userAccessToken = tokenData.access_token;

    if (!userAccessToken) {
      console.error("No access token in Facebook response:", tokenData);
      const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=no_access_token&description=Facebook did not return an access token`;
      return Response.redirect(errorUrl);
    }

    console.log("Facebook access token obtained successfully:", {
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      tokenLength: userAccessToken.length,
      scopes: tokenData.scope,
    });

    // Redirect to our page selection with the access token
    const pageSelectUrl = `${baseUrl}/dashboard/profiles/${profileId}/facebook-page-select?tempToken=${encodeURIComponent(userAccessToken)}&tokenType=user_access_token&flow=api-only`;

    console.log("Redirecting to page selection:", {
      url: pageSelectUrl.replace(userAccessToken, "[REDACTED]"),
      profileId,
      getlateProfileId,
      hasToken: !!userAccessToken,
      tokenLength: userAccessToken.length,
      flow: "API-Only",
    });

    return Response.redirect(pageSelectUrl);
  } catch (tokenError) {
    console.error("Error exchanging Facebook token:", tokenError);
    const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=token_error&description=${encodeURIComponent(tokenError.message)}`;
    return Response.redirect(errorUrl);
  }
}
