import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useUpdateUserPasswordMutation } from "../data/user-management.slice";

// Updated User type to match API, with optional role
interface Group {
  id: string;
  name: string;
  path: string;
}
interface User {
  id: string;
  username: string;
  enabled: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  access: {
    edit: boolean;
    manageGroup?: boolean;
    delete: boolean;
  };
  groups?: Group[];
}

type UpdatePasswordDialogProps = {
  open: boolean;
  user: User | null;
  onOpenChange: (open: boolean) => void;
};

function UpdatePasswordDialog({
  open,
  user,
  onOpenChange
}: UpdatePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [updateUserPassword, { isLoading }] = useUpdateUserPasswordMutation();

  const handleClose = () => {
    setNewPassword("");
    setRetypePassword("");
    setPasswordError("");
    setSuccessMsg("");
    onOpenChange(false);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !retypePassword) {
      setPasswordError("Both fields are required.");
    } else if (newPassword !== retypePassword) {
      setPasswordError("Passwords do not match.");
    } else if (!user) {
      setPasswordError("No user selected.");
    } else {
      setPasswordError("");
      try {
        await updateUserPassword({ userId: user.id, newPassword }).unwrap();
        setSuccessMsg("Password updated successfully.");
        setTimeout(() => {
          handleClose();
        }, 1200);
      } catch (err: any) {
        setPasswordError(
          err?.data?.error_description ||
            err?.data?.message ||
            "Failed to update password."
        );
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="font-medium text-sm">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Re-type Password</label>
            <Input
              type="password"
              value={retypePassword}
              onChange={(e) => setRetypePassword(e.target.value)}
              placeholder="Re-type new password"
            />
          </div>
          {passwordError && (
            <div className="text-red-500 text-sm">{passwordError}</div>
          )}
          <Button
            className="bg-primary-600 hover:bg-primary-700 shadow mt-2 focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 w-full font-semibold text-white text-base"
            onClick={handleUpdatePassword}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
          {successMsg && (
            <div className="mt-2 text-green-600 text-sm">{successMsg}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpdatePasswordDialog;
