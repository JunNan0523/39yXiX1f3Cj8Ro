import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

const GETLATE_API_KEY = process.env.GETLATE_API_KEY;
const GETLATE_BASE_URL = "https://getlate.dev/api";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = params;
    const userId = session.user.id;

    // Check API key availability
    if (!GETLATE_API_KEY) {
      console.error("GETLATE_API_KEY environment variable is not set");
      return Response.json(
        {
          error: "API configuration error. Please check environment variables.",
        },
        { status: 500 },
      );
    }

    // Verify profile belongs to user and get getlate profile ID
    const profile = await sql`
      SELECT id, getlate_profile_id, timezone FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (profile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile[0].getlate_profile_id) {
      return Response.json(
        { error: "Profile not synced with getlate.dev. Please try again." },
        { status: 400 },
      );
    }

    // Get the post data from request body
    const body = await request.json();
    const {
      content,
      scheduledFor,
      timezone,
      publishNow,
      isDraft,
      platforms,
      mediaItems = [],
      tags = [],
    } = body;

    // Validate required fields
    if (!content?.trim()) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    if (!platforms || platforms.length === 0) {
      return Response.json(
        { error: "At least one platform must be selected" },
        { status: 400 },
      );
    }

    if (!publishNow && !isDraft && !scheduledFor) {
      return Response.json(
        {
          error:
            "Please set a schedule time or choose to publish now/save as draft",
        },
        { status: 400 },
      );
    }

    // Fetch connected accounts for this profile from getlate.dev API
    let accounts = [];
    try {
      const accountsResponse = await fetch(
        `${GETLATE_BASE_URL}/v1/accounts?profileId=${profile[0].getlate_profile_id}`,
        {
          headers: {
            Authorization: `Bearer ${GETLATE_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        accounts = accountsData.accounts || [];
      } else {
        console.error(
          "Failed to fetch accounts from getlate.dev:",
          accountsResponse.status,
        );
      }
    } catch (error) {
      console.error("Error fetching accounts from getlate.dev:", error);
    }

    // Transform platforms to include correct getlate account IDs
    const transformedPlatforms = platforms.map((platform) => {
      const account = accounts.find(
        (acc) => acc.platform === platform.platform && acc.isActive,
      );

      if (!account) {
        throw new Error(
          `No connected ${platform.platform} account found for this profile`,
        );
      }

      return {
        platform: platform.platform,
        accountId: account._id, // Use the getlate account ID
        platformSpecificData: platform.platformSpecificData || {},
      };
    });

    // Prepare the payload for GetLate API
    const postPayload = {
      content,
      platforms: transformedPlatforms,
      timezone: timezone || profile[0].timezone || "America/New_York",
      publishNow: publishNow || false,
      isDraft: isDraft || false,
      mediaItems,
      tags: Array.isArray(tags) ? tags : [],
    };

    // Add scheduling if not publishing now and not draft
    if (!publishNow && !isDraft && scheduledFor) {
      postPayload.scheduledFor = scheduledFor;
    }

    console.log("Creating post via getlate.dev API:", {
      profileId: profile[0].getlate_profile_id,
      platforms: transformedPlatforms.map((p) => p.platform),
      publishNow,
      isDraft,
      hasSchedule: !!scheduledFor,
    });

    // Call GetLate API to create the post
    const getLateResponse = await fetch(`${GETLATE_BASE_URL}/v1/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GETLATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postPayload),
    });

    const responseData = await getLateResponse.json();

    if (!getLateResponse.ok) {
      console.error("GetLate API error:", getLateResponse.status, responseData);
      return Response.json(
        {
          error: responseData.error || "Failed to create post via GetLate API",
          details: responseData,
        },
        {
          status: getLateResponse.status,
        },
      );
    }

    // Return success response
    return Response.json(
      {
        success: true,
        post: responseData,
        message: isDraft
          ? "Draft saved successfully"
          : publishNow
            ? "Post published successfully"
            : "Post scheduled successfully",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return Response.json(
      {
        error: error.message || "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = params;
    const userId = session.user.id;

    // Check API key availability
    if (!GETLATE_API_KEY) {
      console.error("GETLATE_API_KEY environment variable is not set");
      return Response.json(
        {
          error: "API configuration error. Please check environment variables.",
        },
        { status: 500 },
      );
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
        { error: "Profile not synced with getlate.dev. Please try again." },
        { status: 400 },
      );
    }

    // Extract query parameters for filtering
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "10";
    const status = url.searchParams.get("status"); // draft, scheduled, published, failed
    const platform = url.searchParams.get("platform"); // tiktok, instagram, youtube, linkedin, twitter, threads
    const customStartDate = url.searchParams.get("startDate");
    const customEndDate = url.searchParams.get("endDate");

    // Build getlate.dev API URL
    const getlateUrl = new URL(`${GETLATE_BASE_URL}/v1/posts`);
    getlateUrl.searchParams.set("page", page);
    getlateUrl.searchParams.set("limit", limit);
    getlateUrl.searchParams.set("profileId", profile[0].getlate_profile_id);

    // Add filters if provided (only status and platform are supported by getlate API)
    if (status) {
      getlateUrl.searchParams.set("status", status);
    }
    if (platform) {
      getlateUrl.searchParams.set("platform", platform);
    }

    console.log("Fetching posts from getlate.dev:", getlateUrl.toString());

    // Fetch posts from getlate.dev
    const getlateResponse = await fetch(getlateUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GETLATE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!getlateResponse.ok) {
      const errorText = await getlateResponse.text();
      console.error(
        "Getlate.dev posts API error:",
        getlateResponse.status,
        errorText,
      );
      return Response.json(
        {
          error: `Failed to fetch posts: ${errorText}`,
          status: getlateResponse.status,
        },
        { status: getlateResponse.status },
      );
    }

    const postsData = await getlateResponse.json();

    // Transform posts to ensure consistent ID field
    let transformedPosts = (postsData.posts || []).map((post) => ({
      ...post,
      id: post._id || post.id, // Map _id to id for consistency
    }));

    // Apply client-side date filtering if startDate/endDate are provided
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        transformedPosts = transformedPosts.filter((post) => {
          if (!post.scheduledFor) return false;
          const postDate = new Date(post.scheduledFor);
          return postDate >= startDate && postDate <= endDate;
        });
      }
    }

    return Response.json({
      posts: transformedPosts,
      pagination: postsData.pagination || {},
      profile: {
        id: profile[0].id,
        getlate_profile_id: profile[0].getlate_profile_id,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
