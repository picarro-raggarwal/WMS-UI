import {
  useGetInletsQuery,
  useGetPortConfigurationQuery
} from "@/pages/settings/data/port-configuration.slice";
import { useGetProfileQuery } from "@/pages/settings/data/user-management.slice";
import { AuthTokenResponse, PasswordUpdateRequiredResponse } from "@/utils";
import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

// Define user interface
interface User {
  name: string;
  email: string;
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  access?: {
    edit: boolean;
    manageGroup?: boolean;
    delete: boolean;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  needsPasswordChange: boolean;
  pendingPasswordChangeUserId?: string;
  login: (res: AuthTokenResponse | PasswordUpdateRequiredResponse) => void;
  logout: () => void;
  setPasswordChanged: () => void;
}

const defaultUser = {
  name: "service",
  email: "service@picarro.com"
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    // If user is authenticated but no user data exists, use default user
    if (localStorage.getItem("isAuthenticated") === "true" && !savedUser) {
      localStorage.setItem("user", JSON.stringify(defaultUser));
      return defaultUser;
    }
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [needsPasswordChange, setNeedsPasswordChange] = useState(() => {
    return localStorage.getItem("needsPasswordChange") === "true";
  });

  const [pendingPasswordChangeUserId, setPendingPasswordChangeUserId] =
    useState<string | undefined>(() => {
      return localStorage.getItem("pendingPasswordChangeUserId") || undefined;
    });

  // Fetch user profile when authenticated
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || !localStorage.getItem("token")
  });

  // Track if profile API was successful
  const isProfileSuccess = !!profileData?.result;

  // Trigger inlet and port configuration APIs only after profile API is successful
  useGetInletsQuery(undefined, {
    skip:
      !isAuthenticated || !localStorage.getItem("token") || !isProfileSuccess
  });

  useGetPortConfigurationQuery(undefined, {
    skip:
      !isAuthenticated || !localStorage.getItem("token") || !isProfileSuccess
  });

  // Update user data when profile is fetched
  useEffect(() => {
    if (profileData?.result && isAuthenticated) {
      const profileUser = profileData.result;

      const userData: User = {
        id: profileUser.id,
        name:
          `${profileUser.firstName || ""} ${
            profileUser.lastName || ""
          }`.trim() || profileUser.username,
        email: profileUser.email || "",
        username: profileUser.username,
        firstName: profileUser.firstName,
        lastName: profileUser.lastName,
        enabled: profileUser.enabled,
        access: profileUser.access
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }, [profileData, isAuthenticated]);

  const login = (res: AuthTokenResponse | PasswordUpdateRequiredResponse) => {
    // Check if this is a password update required response
    if (
      "code" in res &&
      res.code === "required_update_password" &&
      res.userid
    ) {
      setIsAuthenticated(true);
      setNeedsPasswordChange(true);
      setPendingPasswordChangeUserId(res.userid);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("needsPasswordChange", "true");
      localStorage.setItem("pendingPasswordChangeUserId", res.userid);
    } else if ("access_token" in res && res.access_token) {
      // Normal login flow - cast to AuthTokenResponse since we know it has access_token
      const tokenResponse = res as AuthTokenResponse;
      setIsAuthenticated(true);
      setNeedsPasswordChange(false);
      setPendingPasswordChangeUserId(undefined);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("token", tokenResponse.access_token);
      localStorage.setItem("refresh_token", tokenResponse.refresh_token);
      localStorage.removeItem("needsPasswordChange");
      localStorage.removeItem("pendingPasswordChangeUserId");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setNeedsPasswordChange(false);
    setPendingPasswordChangeUserId(undefined);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("needsPasswordChange");
    localStorage.removeItem("pendingPasswordChangeUserId");
  };

  const setPasswordChanged = () => {
    // Reset authentication state so user can login again with new credentials
    setIsAuthenticated(false);
    setNeedsPasswordChange(false);
    setPendingPasswordChangeUserId(undefined);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("needsPasswordChange");
    localStorage.removeItem("pendingPasswordChangeUserId");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        needsPasswordChange,
        pendingPasswordChangeUserId,
        login,
        logout,
        setPasswordChanged
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// PublicRoute.tsx
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsPasswordChange, user } = useAuth();
  const location = useLocation();

  // If authenticated and needs password change, stay on login page to show change password form
  if (isAuthenticated && needsPasswordChange) {
    return <>{children}</>;
  }

  // If authenticated, user profile loaded, and doesn't need password change, redirect to dashboard
  if (isAuthenticated && user && !needsPasswordChange) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
