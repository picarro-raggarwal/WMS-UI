import { clearAuthData } from "@/common/ProtectedBaseQuery";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useUpdateUserPasswordMutation } from "@/pages/settings/data/user-management.slice";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function ChangePasswordForm() {
  const navigate = useNavigate();
  const { user, setPasswordChanged } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [updatePassword, { isLoading }] = useUpdateUserPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
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
      if (!user?.email) {
        setError("User information not available.");
        return;
      }

      // Use email if user ID is undefined, otherwise use user ID
      const userId = user.id || user.email;

      await updatePassword({ userId, newPassword }).unwrap();
      setSuccess(true);

      // Mark password as changed
      setPasswordChanged();

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(
        err?.data?.message || "Failed to update password. Please try again."
      );
    }
  };

  const handleCancel = () => {
    // Logout the user if they cancel
    clearAuthData();
    window.location.href = "/";
  };

  if (success) {
    return (
      <div className="flex flex-col gap-6 bg-white shadow-lg p-8 rounded-2xl w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="mx-auto w-12 h-12 text-green-600">
            <CheckCircle size={48} />
          </div>
          <h2 className="mt-2 font-semibold text-neutral-800 text-xl">
            Password Updated Successfully
          </h2>
          <p className="text-neutral-600 text-sm text-center">
            Your password has been changed. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 bg-white shadow-lg p-8 rounded-2xl w-full max-w-md">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <h2 className="mt-2 font-semibold text-neutral-800 text-xl">
          Change Your Password
        </h2>
        <p className="text-neutral-600 text-sm text-center">
          Welcome! Please change your temporary password to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="current-password"
            className="font-medium text-neutral-800 text-sm"
          >
            Current Password
          </label>
          <div className="relative">
            <Input
              id="current-password"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter your current password"
              autoComplete="current-password"
              className="bg-white px-4 pr-10 border border-neutral-200 rounded-xl h-11 text-neutral-900 placeholder:text-neutral-500 placeholder:text-sm"
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={
                showCurrentPassword ? "Hide password" : "Show password"
              }
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="top-1/2 right-3 absolute focus:outline-none text-neutral-500 hover:text-neutral-700 -translate-y-1/2"
            >
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="new-password"
            className="font-medium text-neutral-800 text-sm"
          >
            New Password
          </label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter your new password"
              autoComplete="new-password"
              className="bg-white px-4 pr-10 border border-neutral-200 rounded-xl h-11 text-neutral-900 placeholder:text-neutral-500 placeholder:text-sm"
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="top-1/2 right-3 absolute focus:outline-none text-neutral-500 hover:text-neutral-700 -translate-y-1/2"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirm-password"
            className="font-medium text-neutral-800 text-sm"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your new password"
              autoComplete="new-password"
              className="bg-white px-4 pr-10 border border-neutral-200 rounded-xl h-11 text-neutral-900 placeholder:text-neutral-500 placeholder:text-sm"
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="top-1/2 right-3 absolute focus:outline-none text-neutral-500 hover:text-neutral-700 -translate-y-1/2"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex space-x-3 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 hover:bg-neutral-50 border-neutral-200 text-neutral-700"
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
