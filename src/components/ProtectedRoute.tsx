import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHasRole, AppRole } from "@/hooks/useRoles";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo = "/" 
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, isLoading: roleLoading } = useHasRole(user?.id, requiredRole || "user");

  // Show loading state while checking authentication and roles
  if (authLoading || (requiredRole && roleLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if role requirement is not met
  if (requiredRole && !hasRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
