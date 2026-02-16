import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export default function ProtectedRoute({ children, requiredPermissions }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permissions if required
  if (requiredPermissions && user) {
    const hasPermission = requiredPermissions.every(
      perm => user.permissions.includes(perm)
    );
    
    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="glass-panel p-8 max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-sm mb-6">
              You don't have permission to access this page. Contact your supervisor for access.
            </p>
            <p className="text-xs text-muted-foreground">
              Required: {requiredPermissions.join(", ")}
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
