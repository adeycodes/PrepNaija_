import { useQuery } from "@tanstack/react-query";
import type { AuthUser } from "@/types";
import { apiFetch } from "@/lib/apiClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    queryFn: async () => {
      const res = await apiFetch("/api/auth/me");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      return data.user as AuthUser;
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
