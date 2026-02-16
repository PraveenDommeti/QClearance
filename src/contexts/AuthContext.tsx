import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { User, Session } from "@/types/flight";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateActivity: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  controller: {
    password: "atc123",
    user: {
      id: "U001",
      username: "controller",
      role: "controller",
      name: "John Smith",
      badge: "ATC-DXB-042",
      permissions: ["view-flights", "approve-clearances", "run-analysis"],
    },
  },
  supervisor: {
    password: "sup123",
    user: {
      id: "U002",
      username: "supervisor",
      role: "supervisor",
      name: "Sarah Johnson",
      badge: "SUP-DXB-007",
      permissions: ["view-flights", "approve-clearances", "run-analysis", "view-audit", "replay-incidents", "override-decisions"],
    },
  },
  admin: {
    password: "admin123",
    user: {
      id: "U003",
      username: "admin",
      role: "admin",
      name: "Admin User",
      badge: "ADM-DXB-001",
      permissions: ["view-flights", "approve-clearances", "run-analysis", "view-audit", "replay-incidents", "override-decisions", "manage-users", "system-config"],
    },
  },
};

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("qclearance_session");
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        const sessionExpiry = new Date(parsed.expiresAt);
        const lastActivity = new Date(parsed.lastActivity);
        const now = new Date();

        // Check if session is still valid
        if (sessionExpiry > now) {
          // Check for idle timeout
          const idleTime = now.getTime() - lastActivity.getTime();
          if (idleTime < IDLE_TIMEOUT) {
            setUser(parsed.user);
            setSession({
              ...parsed,
              expiresAt: sessionExpiry,
              lastActivity: now,
            });
            // Update last activity in storage
            localStorage.setItem("qclearance_session", JSON.stringify({
              ...parsed,
              lastActivity: now.toISOString(),
            }));
          } else {
            // Idle timeout - clear session
            localStorage.removeItem("qclearance_session");
          }
        } else {
          // Session expired - clear storage
          localStorage.removeItem("qclearance_session");
        }
      } catch (e) {
        localStorage.removeItem("qclearance_session");
      }
    }
    setIsLoading(false);
  }, []);

  // Set up idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    if (session) {
      idleTimerRef.current = setTimeout(() => {
        // Force re-login on idle timeout
        logout();
      }, IDLE_TIMEOUT);
    }
  }, [session]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetIdleTimer]);

  const updateActivity = useCallback(() => {
    if (session) {
      const now = new Date();
      const updatedSession = { ...session, lastActivity: now };
      setSession(updatedSession);
      localStorage.setItem("qclearance_session", JSON.stringify({
        ...updatedSession,
        expiresAt: updatedSession.expiresAt.toISOString(),
        lastActivity: now.toISOString(),
      }));
      resetIdleTimer();
    }
  }, [session, resetIdleTimer]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser = MOCK_USERS[username.toLowerCase()];
    
    if (!mockUser || mockUser.password !== password) {
      setError("Invalid username or password");
      setIsLoading(false);
      return false;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION);
    
    const newSession: Session = {
      user: mockUser.user,
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt,
      lastActivity: now,
    };

    setUser(mockUser.user);
    setSession(newSession);
    
    localStorage.setItem("qclearance_session", JSON.stringify({
      ...newSession,
      expiresAt: expiresAt.toISOString(),
      lastActivity: now.toISOString(),
    }));

    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSession(null);
    localStorage.removeItem("qclearance_session");
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    login,
    logout,
    updateActivity,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: string[]
) {
  return function ProtectedComponent(props: P) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return null; // Will be handled by ProtectedRoute
    }

    if (requiredPermissions && user) {
      const hasPermission = requiredPermissions.every(
        perm => user.permissions.includes(perm)
      );
      if (!hasPermission) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-destructive text-lg font-medium">Access Denied</p>
              <p className="text-muted-foreground text-sm mt-2">
                You don't have permission to access this resource.
              </p>
            </div>
          </div>
        );
      }
    }

    return <Component {...props} />;
  };
}
