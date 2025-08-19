import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

const GETLATE_API_KEY = process.env.GETLATE_API_KEY;
const GETLATE_BASE_URL = "https://getlate.dev/api";

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId, postId } = params;
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

    // Verify profile belongs to user and get user timezone
    const [profile] = await sql`
      SELECT p.id, p.getlate_profile_id, u.timezone as user_timezone
      FROM profiles p
      JOIN auth_users u ON p.user_id = u.id
      WHERE p.id = ${profileId} AND p.user_id = ${userId}
    `;

    if (!profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.getlate_profile_id) {
      return Response.json(
        { error: "Profile not synced with getlate.dev. Please try again." },
        { status: 400 },
      );
    }

    // Get the update data from request body
    const updateData = await request.json();

    // Step 1: GET the complete current post data first
    const getCurrentResponse = await fetch(
      `${GETLATE_BASE_URL}/v1/posts/${postId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${GETLATE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!getCurrentResponse.ok) {
      const errorData = await getCurrentResponse.json().catch(() => ({}));
      console.error(
        "Failed to get current post data:",
        getCurrentResponse.status,
        errorData,
      );
      return Response.json(
        { error: "Failed to fetch current post data" },
        { status: getCurrentResponse.status },
      );
    }

    const currentPost = await getCurrentResponse.json();

    // Step 2: Build PUT payload with only supported fields according to GetLate API docs
    const putPayload = {};

    // Content - always preserve original if not updating
    if (updateData.content !== undefined) {
      putPayload.content = updateData.content;
    } else if (currentPost.content) {
      putPayload.content = currentPost.content;
    }

    // Scheduled time
    if (updateData.scheduledFor !== undefined) {
      putPayload.scheduledFor = updateData.scheduledFor;
    } else if (currentPost.scheduledFor) {
      putPayload.scheduledFor = currentPost.scheduledFor;
    }

    // Use user's timezone from auth_users table, not post's timezone
    putPayload.timezone = profile.user_timezone || "America/New_York";

    // Publishing flags
    putPayload.publishNow =
      updateData.publishNow !== undefined
        ? updateData.publishNow
        : currentPost.publishNow || false;

    putPayload.isDraft =
      updateData.isDraft !== undefined
        ? updateData.isDraft
        : currentPost.isDraft || false;

    // Media items - preserve exactly as they are
    if (updateData.mediaItems !== undefined) {
      putPayload.mediaItems = updateData.mediaItems;
    } else if (currentPost.mediaItems) {
      putPayload.mediaItems = currentPost.mediaItems;
    }

    // Tags
    if (updateData.tags !== undefined) {
      putPayload.tags = updateData.tags;
    } else if (currentPost.tags && Array.isArray(currentPost.tags)) {
      putPayload.tags = currentPost.tags;
    }

    // Platforms - either updated or preserved
    if (updateData.platforms && updateData.platforms.length > 0) {
      // If platforms are being updated, validate accounts
      try {
        const accountsResponse = await fetch(
          `${GETLATE_BASE_URL}/v1/accounts?profileId=${profile.getlate_profile_id}`,
          {
            headers: {
              Authorization: `Bearer ${GETLATE_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          const accounts = accountsData.accounts || [];

          // Transform platforms to include correct getlate account IDs
          const transformedPlatforms = updateData.platforms.map((platform) => {
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
              accountId: account._id,
              platformSpecificData: platform.platformSpecificData || {},
            };
          });

          putPayload.platforms = transformedPlatforms;
        }
      } catch (error) {
        console.error("Error fetching accounts from getlate.dev:", error);
        return Response.json(
          { error: "Failed to validate connected accounts" },
          { status: 500 },
        );
      }
    } else if (currentPost.platforms && Array.isArray(currentPost.platforms)) {
      // Preserve existing platforms exactly as they are
      putPayload.platforms = currentPost.platforms;
    }

    console.log("Updating post via getlate.dev API:", {
      postId,
      profileId: profile.getlate_profile_id,
      updateFields: Object.keys(updateData),
      usingUserTimezone: profile.user_timezone,
      payloadFields: Object.keys(putPayload),
      hasMediaItems: !!(
        putPayload.mediaItems && putPayload.mediaItems.length > 0
      ),
    });

    // Step 3: Send the filtered payload to GetLate PUT API
    const getLateResponse = await fetch(
      `${GETLATE_BASE_URL}/v1/posts/${postId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GETLATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(putPayload),
      },
    );

    const responseData = await getLateResponse.json();

    console.log("GetLate API Response:", {
      status: getLateResponse.status,
      ok: getLateResponse.ok,
      postId: postId,
      hasResponseMedia: !!(
        responseData.mediaItems && responseData.mediaItems.length > 0
      ),
    });

    if (!getLateResponse.ok) {
      console.error("GetLate API error:", getLateResponse.status, responseData);

      if (
        getLateResponse.status === 400 &&
        responseData.error?.includes("cannot be edited")
      ) {
        return Response.json(
          {
            error:
              "This post cannot be edited. Only draft and scheduled posts can be modified.",
          },
          { status: 400 },
        );
      }

      return Response.json(
        {
          error: responseData.error || "Failed to update post via GetLate API",
          details: responseData,
        },
        { status: getLateResponse.status },
      );
    }

    // Return success response
    return Response.json(
      {
        success: true,
        post: responseData,
        message: "Post updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating post:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
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

    const { profileId, postId } = params;
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

    // Verify profile belongs to user
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

    console.log("Deleting post via getlate.dev API:", {
      postId,
      profileId: profile[0].getlate_profile_id,
    });

    // Call GetLate API to delete the post
    const getLateResponse = await fetch(
      `${GETLATE_BASE_URL}/v1/posts/${postId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${GETLATE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!getLateResponse.ok) {
      const responseData = await getLateResponse.json().catch(() => ({}));
      console.error("GetLate API error:", getLateResponse.status, responseData);

      // Handle specific error cases
      if (
        getLateResponse.status === 400 &&
        responseData.error?.includes("cannot be deleted")
      ) {
        return Response.json(
          {
            error:
              "This post cannot be deleted. Published posts cannot be removed.",
          },
          { status: 400 },
        );
      }

      if (getLateResponse.status === 404) {
        return Response.json(
          {
            error: "Post not found",
          },
          { status: 404 },
        );
      }

      return Response.json(
        {
          error: responseData.error || "Failed to delete post via GetLate API",
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
        message: "Post deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error deleting post:", error);
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

    const { profileId, postId } = params;
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

    // Verify profile belongs to user
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

    // Call GetLate API to get the specific post
    const getLateResponse = await fetch(
      `${GETLATE_BASE_URL}/v1/posts/${postId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${GETLATE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!getLateResponse.ok) {
      const responseData = await getLateResponse.json().catch(() => ({}));
      console.error("GetLate API error:", getLateResponse.status, responseData);

      if (getLateResponse.status === 404) {
        return Response.json(
          {
            error: "Post not found",
          },
          { status: 404 },
        );
      }

      return Response.json(
        {
          error: responseData.error || "Failed to fetch post via GetLate API",
          details: responseData,
        },
        {
          status: getLateResponse.status,
        },
      );
    }

    const postData = await getLateResponse.json();

    // Transform post data to ensure consistent ID field
    const transformedPost = {
      ...postData,
      id: postData._id || postData.id, // Map _id to id for consistency
    };

    // Return the post data
    return Response.json(
      {
        success: true,
        post: transformedPost,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error fetching post:", error);
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
