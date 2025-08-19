import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

const GETLATE_API_KEY = process.env.GETLATE_API_KEY;
const GETLATE_BASE_URL = "https://getlate.dev/api";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get profiles from our database
    const profiles = await sql`
      SELECT id, name, description, color, getlate_profile_id, is_default, created_at
      FROM profiles 
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at ASC
    `;

    return Response.json({ profiles });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return Response.json(
      { error: "Failed to fetch profiles" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const {
      name,
      description,
      color = "#ffeda0",
      is_default = false,
    } = await request.json();

    if (!name) {
      return Response.json(
        { error: "Profile name is required" },
        { status: 400 },
      );
    }

    // Check if user has reached profile limit (for now, set to 10)
    const existingProfiles = await sql`
      SELECT COUNT(*) as count FROM profiles WHERE user_id = ${userId}
    `;

    if (existingProfiles[0].count >= 10) {
      return Response.json(
        {
          error: "Profile limit reached. You can create up to 10 profiles.",
        },
        { status: 403 },
      );
    }

    // If this is the first profile or user wants to set as default, handle default logic
    const shouldSetAsDefault = existingProfiles[0].count === 0 || is_default;

    // If setting as default, first unset any existing default profile
    if (shouldSetAsDefault && existingProfiles[0].count > 0) {
      await sql`
        UPDATE profiles 
        SET is_default = FALSE 
        WHERE user_id = ${userId} AND is_default = TRUE
      `;
    }

    // Create profile in getlate.dev
    let getlateProfileId = null;
    try {
      console.log("Creating profile in getlate.dev with data:", {
        name,
        description: description || "",
        color,
      });

      const getlateResponse = await fetch(`${GETLATE_BASE_URL}/v1/profiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GETLATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || "",
          color,
        }),
      });

      console.log("Getlate.dev response status:", getlateResponse.status);

      if (getlateResponse.ok) {
        const getlateData = await getlateResponse.json();
        console.log(
          "Getlate.dev response data:",
          JSON.stringify(getlateData, null, 2),
        );

        // Fix: getlate.dev returns data in format {"message": "...", "profile": {"_id": "..."}}
        getlateProfileId = getlateData?.profile?._id;
        console.log("Extracted getlate profile ID:", getlateProfileId);

        if (!getlateProfileId) {
          console.error(
            "Failed to extract profile ID from response:",
            getlateData,
          );
        }
      } else {
        const errorText = await getlateResponse.text();
        console.warn(
          "Failed to create profile in getlate.dev. Status:",
          getlateResponse.status,
          "Response:",
          errorText,
        );
      }
    } catch (error) {
      console.error("Error creating profile in getlate.dev:", error);
    }

    // Create profile in our database
    const newProfile = await sql`
      INSERT INTO profiles (user_id, name, description, color, getlate_profile_id, is_default)
      VALUES (${userId}, ${name}, ${description || ""}, ${color}, ${getlateProfileId}, ${shouldSetAsDefault})
      RETURNING id, name, description, color, getlate_profile_id, is_default, created_at
    `;

    return Response.json({ profile: newProfile[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return Response.json(
      { error: "Failed to create profile" },
      { status: 500 },
    );
  }
}
