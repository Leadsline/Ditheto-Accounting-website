import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";

export function useRole() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-role", isSignedIn ? "signed-in" : "signed-out"],
    queryFn: async () => {
      const response = await fetch("/api/admin/me", { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load staff role");
      return response.json() as Promise<{ role: string }>;
    },
    enabled: authLoaded && Boolean(isSignedIn),
    retry: false,
  });
  const role = data?.role ?? "";
  const isFullAccess = ["super_admin", "ceo", "senior_manager"].includes(role);
  return {
    role,
    isSuperAdmin: role === "super_admin",
    isFullAccess,
    isMarketingOnly: role === "marketing_staff" || role === "staff",
    isLoaded: authLoaded && (!isSignedIn || !isLoading),
    isUnauthorized: Boolean(isSignedIn && !isLoading && isError),
  };
}