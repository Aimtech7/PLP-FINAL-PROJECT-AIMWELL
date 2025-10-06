import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moderator" | "user";

export const useRoles = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-roles", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) throw error;
      return data.map((r) => r.role as AppRole);
    },
    enabled: !!userId,
  });
};

export const useHasRole = (userId: string | undefined, role: AppRole) => {
  const { data: roles = [], isLoading } = useRoles(userId);
  return { hasRole: roles.includes(role), isLoading };
};
