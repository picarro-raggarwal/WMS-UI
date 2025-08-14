import { useRequiredUpdatePasswordMutation } from "@/common/authAPI";
import { clearAuthData } from "@/common/ProtectedBaseQuery";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AuthLogin from "./auth";

export default function ChangePasswordForm() {
  const { user, setPasswordChanged, pendingPasswordChangeUserId } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);

  const [requiredUpdatePassword, { isLoading }] =
    useRequiredUpdatePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    try {
      // Use the pendingPasswordChangeUserId from the API response
      const userId = pendingPasswordChangeUserId || user?.id || user?.email;

      if (!userId) {
        setError("User information not available.");
        return;
      }

      await requiredUpdatePassword({ userId, newPassword }).unwrap();

      // Mark password as changed
      setPasswordChanged();

      // Show success toast
      toast.success(
        "Password updated successfully! Please login with your new credentials."
      );

      // Show login form
      setShowLoginForm(true);
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || "Failed to update password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    // Logout the user if they cancel
    clearAuthData();
    window.location.href = "/";
  };

  // Show login form after successful password change
  if (showLoginForm) {
    return <AuthLogin showSuccessMessage={true} />;
  }

  return (
    <div className="flex flex-col gap-6 bg-white shadow-lg p-8 rounded-2xl w-full max-w-md">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <h2 className="mt-2 font-semibold text-neutral-800 text-xl">
          Change Your Password
        </h2>
        <p className="text-neutral-600 text-sm text-center">
          Please set a new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="newPassword"
            className="text-sm font-medium text-neutral-700"
          >
            New Password
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              className="border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-neutral-700"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              className="border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 shadow focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 font-semibold text-white"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
