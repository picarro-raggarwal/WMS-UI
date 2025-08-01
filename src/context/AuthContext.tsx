import { AuthTokenResponse } from "@/common/authAPI";
import { useGetProfileQuery } from "@/pages/settings/data/user-management.slice";
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
  isPasswordUpdated?: boolean;
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
  login: (res: AuthTokenResponse) => void;
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

  // Fetch user profile when authenticated
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery(
    undefined,
    {
      skip: !isAuthenticated
    }
  );

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
        isPasswordUpdated: profileUser.isPasswordUpdated,
        access: profileUser.access
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // Check if user needs to change password based on backend flag
      if (profileUser.isPasswordUpdated === false) {
        setNeedsPasswordChange(true);
        localStorage.setItem("needsPasswordChange", "true");
      } else {
        setNeedsPasswordChange(false);
        localStorage.removeItem("needsPasswordChange");
      }
    }
  }, [profileData, isAuthenticated]);

  const login = (res: AuthTokenResponse) => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("token", res.access_token);
    localStorage.setItem("refresh_token", res.refresh_token);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setNeedsPasswordChange(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("needsPasswordChange");
    localStorage.removeItem("devIsPasswordUpdated");
  };

  const setPasswordChanged = () => {
    setNeedsPasswordChange(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        needsPasswordChange,
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

  // Wait for profile to be loaded before making redirect decision
  if (isAuthenticated && user && !needsPasswordChange) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
