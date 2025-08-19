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

    const { profileId } = params;
    const userId = session.user.id;

    if (!GETLATE_API_KEY) {
      return Response.json(
        {
          error: "API configuration error. Please check environment variables.",
        },
        { status: 500 },
      );
    }

    // Verify profile belongs to user
    const profile = await sql`
      SELECT id, getlate_profile_id FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (profile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile[0].getlate_profile_id) {
      return Response.json({
        accounts: [],
        supportedPlatforms: [
          "twitter",
          "instagram",
          "facebook",
          "youtube",
          "linkedin",
          "tiktok",
        ],
      });
    }

    // Get accounts from getlate.dev API
    try {
      const response = await fetch(
        `${GETLATE_BASE_URL}/v1/accounts?profileId=${profile[0].getlate_profile_id}`,
        {
          headers: {
            Authorization: `Bearer ${GETLATE_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Getlate.dev accounts API error:",
          response.status,
          errorText,
        );
        return Response.json({
          accounts: [],
          supportedPlatforms: [
            "twitter",
            "instagram",
            "facebook",
            "youtube",
            "linkedin",
            "tiktok",
          ],
          error: `Failed to fetch accounts: ${errorText}`,
        });
      }

      const data = await response.json();

      // Transform the data to match our expected format
      const transformedAccounts = (data.accounts || []).map((account) => ({
        id: account._id,
        platform: account.platform,
        username: account.username || account.displayName,
        display_name: account.displayName,
        profile_picture: account.profilePicture,
        is_active: account.isActive,
        created_at: account.createdAt,
        updated_at: account.updatedAt,
        platform_user_id: account.platformUserId,
        token_expires_at: account.tokenExpiresAt,
      }));

      return Response.json({
        accounts: transformedAccounts,
        supportedPlatforms: [
          "twitter",
          "instagram",
          "facebook",
          "youtube",
          "linkedin",
          "tiktok",
        ],
      });
    } catch (error) {
      console.error("Error fetching accounts from getlate.dev:", error);
      return Response.json({
        accounts: [],
        supportedPlatforms: [
          "twitter",
          "instagram",
          "facebook",
          "youtube",
          "linkedin",
          "tiktok",
        ],
        error: "Failed to fetch accounts from getlate.dev API",
      });
    }
  } catch (error) {
    console.error("Error fetching social accounts:", error);
    return Response.json(
      { error: "Failed to fetch social accounts" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = params;
    const userId = session.user.id;
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");

    if (!accountId) {
      return Response.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    if (!GETLATE_API_KEY) {
      return Response.json(
        {
          error: "API configuration error. Please check environment variables.",
        },
        { status: 500 },
      );
    }

    // Verify profile belongs to user
    const profile = await sql`
      SELECT id, getlate_profile_id FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (profile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    // Delete account connection from getlate.dev API
    try {
      const response = await fetch(
        `${GETLATE_BASE_URL}/v1/accounts/${accountId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${GETLATE_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Getlate.dev delete account API error:",
          response.status,
          errorText,
        );
        return Response.json(
          { error: `Failed to disconnect account: ${errorText}` },
          { status: response.status },
        );
      }

      return Response.json({
        success: true,
        message: "Account disconnected successfully",
      });
    } catch (error) {
      console.error("Error calling getlate.dev delete account API:", error);
      return Response.json(
        { error: "Failed to disconnect account from getlate.dev API" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error disconnecting social account:", error);
    return Response.json(
      { error: "Failed to disconnect social account" },
      { status: 500 },
    );
  }
}
