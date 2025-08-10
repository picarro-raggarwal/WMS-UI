import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AuthLogin from "./auth";
import ChangePasswordForm from "./change-password";
import AuthLayout from "./layout";

const LoginPage = () => {
  const { isAuthenticated, needsPasswordChange, user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();

  // Check if user needs to change password after authentication
  useEffect(() => {
    if (isAuthenticated) {
      if (needsPasswordChange) {
        // Show change password form immediately if password change is required
        setShowChangePassword(true);
      } else if (user) {
        // User is authenticated, profile loaded, and doesn't need password change
        navigate("/dashboard");
      }
      // If authenticated but no user profile yet and no password change needed,
      // wait for profile to load (shows loading state)
    }
  }, [isAuthenticated, needsPasswordChange, user, navigate]);

  // Show loading only if authenticated, no password change needed, and profile not loaded yet
  if (isAuthenticated && !needsPasswordChange && !user) {
    return (
      <AuthLayout>
        <div className="flex flex-col gap-6 bg-white shadow-lg p-8 rounded-2xl w-full max-w-md">
          <div className="flex flex-col items-center gap-2 mb-2">
            <h2 className="mt-2 font-semibold text-neutral-800 text-xl">
              Loading User Profile...
            </h2>
            <p className="text-neutral-600 text-sm text-center">
              Please wait while we load your account details.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {showChangePassword ? <ChangePasswordForm /> : <AuthLogin />}
    </AuthLayout>
  );
};

export default LoginPage;
