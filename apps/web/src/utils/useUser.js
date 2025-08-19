import * as React from "react";
import { useSession } from "@auth/create/react";

const useUser = () => {
  const { data: session, status } = useSession();
  const id = session?.user?.id;

  const [user, setUser] = React.useState(session?.user ?? null);
  const [loading, setLoading] = React.useState(status === "loading");

  const fetchUser = React.useCallback(async () => {
    if (!id) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated
          setUser(null);
          return null;
        }
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      const userData = data.user;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      // Fallback to session data if API fails
      setUser(session?.user ?? null);
      return session?.user ?? null;
    } finally {
      setLoading(false);
    }
  }, [id, session?.user]);

  const refetch = React.useCallback(() => {
    return fetchUser();
  }, [fetchUser]);

  React.useEffect(() => {
    if (status === "authenticated") {
      fetchUser();
    } else if (status === "unauthenticated") {
      setUser(null);
      setLoading(false);
    }
  }, [status, fetchUser]);

  return {
    user,
    data: user,
    loading: status === "loading" || loading,
    refetch,
  };
};

export { useUser };
export default useUser;
