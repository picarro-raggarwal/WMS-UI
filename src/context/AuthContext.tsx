import { AuthTokenResponse } from "@/common/authAPI";
import { createContext, useContext, useState } from "react";
import { Navigate, useLocation } from "react-router";

// Define user interface
interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (res: AuthTokenResponse) => void;
  logout: () => void;
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

  // const login = () => {
  //   setIsAuthenticated(true);
  //   localStorage.setItem("isAuthenticated", "true");

  //   setUser(defaultUser);
  //   localStorage.setItem("user", JSON.stringify(defaultUser));
  // };

  const login = (res: AuthTokenResponse) => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("token", res.access_token);
    localStorage.setItem("refresh_token", res.refresh_token);
    // setUser(defaultUser);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
