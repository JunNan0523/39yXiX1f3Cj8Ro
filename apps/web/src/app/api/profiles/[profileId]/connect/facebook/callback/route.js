import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

const GETLATE_API_KEY = process.env.GETLATE_API_KEY;
const GETLATE_BASE_URL = "https://getlate.dev/api";
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

/**
 * Facebook OAuth Callback Handler - API-Only Flow
 * 
 * Implements the API-only flow recommended by getlate.dev team:
 * 1. Exchange Facebook authorization code for user access token
 * 2. Redirect to our page selection interface with the token
 * 
 * This approach bypasses getlate.dev's hosted UI and avoids "Unauthorized" errors
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = params;
    const userId = session.user.id;
    const url = new URL(request.url);
    
    // Extract OAuth parameters
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    console.log("=== Facebook OAuth Callback ===");
    console.log("Parameters:", {
      profileId,
      userId,
      hasCode: !!code,
      codeLength: code ? code.length : 0,
      state,
      error,
      errorDescription,
      allParams: Object.fromEntries(url.searchParams.entries())
    });

    // Check for Facebook OAuth errors
    if (error) {
      console.error("Facebook OAuth error:", { error, errorDescription });
      
      const baseUrl = process.env.NEXTAUTH_URL || 
        (process.env.NODE_ENV === "production" 
          ? "https://socialelf.created.app" 
          : "http://localhost:3000");
      
      const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`;
      
      return Response.redirect(errorUrl);
    }

    if (!code) {
      console.error("Missing authorization code in Facebook callback");
      const baseUrl = process.env.NEXTAUTH_URL || 
        (process.env.NODE_ENV === "production" 
          ? "https://socialelf.created.app" 
          : "http://localhost:3000");
      
      const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=missing_code&description=No authorization code received from Facebook`;
      
      return Response.redirect(errorUrl);
    }

    // Validate Facebook app configuration
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      console.error("Missing Facebook app credentials");
      return Response.json({
        error: "Facebook app not configured properly",
        setupInstructions: [
          "Set FACEBOOK_APP_ID environment variable",
          "Set FACEBOOK_APP_SECRET environment variable"
        ]
      }, { status: 500 });
    }

    // Parse state parameter to get getlateProfileId
    let getlateProfileId;
    try {
      const stateParams = new URLSearchParams(state);
      getlateProfileId = stateParams.get('getlateProfileId');
      
      if (!getlateProfileId) {
        throw new Error("Missing getlateProfileId in state");
      }
    } catch (stateError) {
      console.error("Invalid state parameter:", stateError);
      return Response.json({
        error: "Invalid state parameter",
        details: stateError.message
      }, { status: 400 });
    }

    // Verify profile belongs to user
    const profile = await sql`
      SELECT id, getlate_profile_id FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (profile.length === 0 || profile[0].getlate_profile_id !== getlateProfileId) {
      console.error("Profile validation failed:", {
        profileExists: profile.length > 0,
        expectedGetlateId: getlateProfileId,
        actualGetlateId: profile[0]?.getlate_profile_id
      });
      return Response.json({ error: "Profile not found or invalid" }, { status: 404 });
    }

    // Step 1: Exchange authorization code for access token
    const baseUrl = process.env.NEXTAUTH_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://socialelf.created.app"
        : "http://localhost:3000");

    const redirectUri = `${baseUrl}/api/profiles/${profileId}/connect/facebook/callback`;

    console.log("Exchanging Facebook code for access token:", {
      codeLength: code.length,
      redirectUri,
      appId: FACEBOOK_APP_ID,
      hasSecret: !!FACEBOOK_APP_SECRET
    });

    // Facebook token exchange
    const tokenUrl = "https://graph.facebook.com/v18.0/oauth/access_token";
    const tokenParams = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      redirect_uri: redirectUri,
      code: code
    });

    const tokenResponse = await fetch(`${tokenUrl}?${tokenParams}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "SocialElf/1.0"
      }
    });

    console.log("Facebook token exchange response:", {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      headers: Object.fromEntries(tokenResponse.headers.entries())
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Facebook token exchange failed:", {
        status: tokenResponse.status,
        error: errorText
      });

      const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=token_exchange_failed&description=${encodeURIComponent(`Facebook token exchange failed: ${errorText}`)}`;
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
      scopes: tokenData.scope
    });

    // Step 2: Redirect to our page selection with the access token
    // We'll pass the token as a URL parameter to our page selection page
    const pageSelectUrl = `${baseUrl}/dashboard/profiles/${profileId}/facebook-page-select?tempToken=${encodeURIComponent(userAccessToken)}&tokenType=user_access_token&flow=api-only`;

    console.log("Redirecting to page selection:", {
      url: pageSelectUrl.replace(userAccessToken, '[REDACTED]'),
      profileId,
      getlateProfileId,
      hasToken: !!userAccessToken,
      tokenLength: userAccessToken.length,
      flow: "API-Only"
    });

    return Response.redirect(pageSelectUrl);

  } catch (error) {
    console.error("Error in Facebook OAuth callback:", error);
    
    const baseUrl = process.env.NEXTAUTH_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://socialelf.created.app"
        : "http://localhost:3000");

    const errorUrl = `${baseUrl}/dashboard/profiles/${profileId}/connect-error?platform=facebook&error=callback_error&description=${encodeURIComponent(error.message)}`;
    
    return Response.redirect(errorUrl);
  }
}