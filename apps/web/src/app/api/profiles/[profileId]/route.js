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

    const profile = await sql`
      SELECT id, name, description, color, getlate_profile_id, is_default, created_at
      FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (profile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    return Response.json({ profile: profile[0] });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = params;
    const userId = session.user.id;
    const { name, description, color, is_default } = await request.json();

    // Check if profile exists and belongs to user
    const existingProfile = await sql`
      SELECT id, name, description, color, getlate_profile_id, is_default FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (existingProfile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    // Handle default profile logic if is_default is being changed
    if (
      is_default !== undefined &&
      is_default &&
      !existingProfile[0].is_default
    ) {
      // User wants to set this profile as default, first unset any existing default
      await sql`
        UPDATE profiles 
        SET is_default = FALSE 
        WHERE user_id = ${userId} AND is_default = TRUE AND id != ${profileId}
      `;
    }

    // Update profile in getlate.dev if it exists there, or create it if it doesn't exist
    let getlateProfileId = existingProfile[0].getlate_profile_id;

    if (!getlateProfileId) {
      // Profile doesn't exist in getlate.dev, create it first
      try {
        const createResponse = await fetch(`${GETLATE_BASE_URL}/v1/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GETLATE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name || existingProfile[0].name,
            description: description || existingProfile[0].description || "",
            color: color || existingProfile[0].color || "#ffeda0",
          }),
        });

        if (createResponse.ok) {
          const createData = await createResponse.json();
          getlateProfileId = createData?.profile?._id;
          console.log("Created getlate.dev profile with ID:", getlateProfileId);
        } else {
          console.warn(
            "Failed to create profile in getlate.dev:",
            await createResponse.text(),
          );
        }
      } catch (error) {
        console.warn("Error creating profile in getlate.dev:", error);
      }
    } else {
      // Profile exists in getlate.dev, update it
      try {
        const updateResponse = await fetch(
          `${GETLATE_BASE_URL}/v1/profiles/${getlateProfileId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${GETLATE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              description: description || "",
              color: color || "#ffeda0",
            }),
          },
        );

        if (!updateResponse.ok) {
          console.warn(
            "Failed to update profile in getlate.dev:",
            await updateResponse.text(),
          );
        }
      } catch (error) {
        console.warn("Error updating profile in getlate.dev:", error);
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (color !== undefined) {
      updateFields.push(`color = $${paramIndex++}`);
      values.push(color);
    }
    if (is_default !== undefined) {
      updateFields.push(`is_default = $${paramIndex++}`);
      values.push(is_default);
    }

    // Update getlate_profile_id if we created a new one
    if (
      getlateProfileId &&
      getlateProfileId !== existingProfile[0].getlate_profile_id
    ) {
      updateFields.push(`getlate_profile_id = $${paramIndex++}`);
      values.push(getlateProfileId);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(profileId, userId);

    const updateQuery = `
      UPDATE profiles 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
      RETURNING id, name, description, color, getlate_profile_id, is_default, created_at, updated_at
    `;

    const updatedProfile = await sql(updateQuery, values);

    return Response.json({ profile: updatedProfile[0] });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json(
      { error: "Failed to update profile" },
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

    // Check if profile exists and belongs to user
    const existingProfile = await sql`
      SELECT id, name, description, color, getlate_profile_id FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    if (existingProfile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if profile has connected social accounts via getlate.dev API
    if (existingProfile[0].getlate_profile_id) {
      try {
        const response = await fetch(
          `${GETLATE_BASE_URL}/v1/accounts?profileId=${existingProfile[0].getlate_profile_id}`,
          {
            headers: {
              Authorization: `Bearer ${GETLATE_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const activeAccounts = (data.accounts || []).filter(
            (account) => account.isActive,
          );

          if (activeAccounts.length > 0) {
            return Response.json(
              {
                error:
                  "Cannot delete profile with connected social media accounts. Disconnect all accounts first.",
              },
              { status: 400 },
            );
          }
        } else {
          console.warn(
            "Could not check accounts via getlate.dev API:",
            await response.text(),
          );
        }
      } catch (error) {
        console.warn("Error checking accounts via getlate.dev API:", error);
        // Continue with deletion if API check fails - this prevents API issues from blocking profile deletion
      }
    }

    // Delete profile from getlate.dev if it exists there
    if (existingProfile[0].getlate_profile_id) {
      try {
        await fetch(
          `${GETLATE_BASE_URL}/v1/profiles/${existingProfile[0].getlate_profile_id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${GETLATE_API_KEY}`,
            },
          },
        );
      } catch (error) {
        console.warn("Error deleting profile from getlate.dev:", error);
      }
    }

    // Delete profile from our database
    await sql`
      DELETE FROM profiles 
      WHERE id = ${profileId} AND user_id = ${userId}
    `;

    return Response.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return Response.json(
      { error: "Failed to delete profile" },
      { status: 500 },
    );
  }
}
