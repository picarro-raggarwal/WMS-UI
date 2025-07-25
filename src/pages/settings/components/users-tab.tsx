import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { KeyRound, Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetGroupsListQuery,
  useGetUserByIdQuery,
  useGetUsersListQuery,
  useUpdateUserMutation,
  useUpdateUserPasswordMutation
} from "../data/user-management.slice";

// Add Group type
interface Group {
  id: string;
  name: string;
  path: string;
}
// Updated User type to match API, with optional role
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

// Reusable UserForm component for Add/Edit User
function UserForm({
  initialUser,
  onSubmit,
  submitLabel,
  onChange,
  loading = false,
  groupsOptions
}: {
  initialUser: Partial<User>;
  onSubmit: () => void;
  submitLabel: string;
  onChange: (user: Partial<User>) => void;
  loading?: boolean;
  groupsOptions: Group[];
}) {
  const selectedGroups = Array.isArray(initialUser.groups)
    ? initialUser.groups
    : [];
  const [error, setError] = useState<string>("");

  const handleGroupChange = (group: Group) => {
    const exists = selectedGroups.some((g) => g.id === group.id);
    if (exists) {
      onChange({
        ...initialUser,
        groups: selectedGroups.filter((g) => g.id !== group.id)
      });
    } else {
      onChange({ ...initialUser, groups: [...selectedGroups, group] });
    }
  };

  const handleSubmit = () => {
    if (
      !initialUser.username ||
      !initialUser.firstName ||
      !initialUser.lastName ||
      !initialUser.email ||
      !initialUser.enabled ||
      selectedGroups.length === 0
    ) {
      setError("All fields are required, including at least one group.");
      return;
    }
    setError("");
    onSubmit();
  };

  // For badge display and dropdown
  const MAX_VISIBLE_GROUPS = 3;
  const visibleGroups = selectedGroups.slice(0, MAX_VISIBLE_GROUPS);
  const hiddenCount = selectedGroups.length - MAX_VISIBLE_GROUPS;

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="space-y-2">
        <label className="font-medium text-sm">Username</label>
        <Input
          value={initialUser.username || ""}
          onChange={(e) =>
            onChange({ ...initialUser, username: e.target.value })
          }
          placeholder="Enter username"
        />
      </div>
      <div className="space-y-2">
        <label className="font-medium text-sm">First Name</label>
        <Input
          value={initialUser.firstName || ""}
          onChange={(e) =>
            onChange({ ...initialUser, firstName: e.target.value })
          }
          placeholder="Enter first name"
        />
      </div>
      <div className="space-y-2">
        <label className="font-medium text-sm">Last Name</label>
        <Input
          value={initialUser.lastName || ""}
          onChange={(e) =>
            onChange({ ...initialUser, lastName: e.target.value })
          }
          placeholder="Enter last name"
        />
      </div>
      <div className="space-y-2">
        <label className="font-medium text-sm">Email</label>
        <Input
          type="email"
          value={initialUser.email || ""}
          onChange={(e) => onChange({ ...initialUser, email: e.target.value })}
          placeholder="Enter email"
        />
      </div>
      <div className="space-y-2">
        <label className="font-medium text-sm">Groups</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-between w-full"
              type="button"
            >
              <span className="flex flex-wrap gap-1">
                {selectedGroups.length > 0 ? (
                  <>
                    {visibleGroups.map((group) => (
                      <span
                        key={group.id}
                        className="flex justify-center items-center bg-primary-100 dark:bg-primary-900 px-3 py-1 rounded-full font-medium text-primary-800 dark:text-primary-200 text-xs"
                      >
                        {group.name}
                      </span>
                    ))}
                    {hiddenCount > 0 && (
                      <span className="flex justify-center items-center bg-muted px-3 py-1 rounded-full font-medium text-muted-foreground text-xs">
                        +{hiddenCount}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-normal text-muted-foreground">
                    Select groups
                  </span>
                )}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px]">
            {groupsOptions.map((group) => {
              const checked = selectedGroups.some((g) => g.id === group.id);
              return (
                <DropdownMenuItem
                  key={group.id}
                  className="flex items-center space-x-2 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleGroupChange(group);
                  }}
                >
                  <Checkbox checked={checked} />
                  <span>{group.name}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Checkbox
          checked={initialUser.enabled ?? true}
          onCheckedChange={(checked) =>
            onChange({ ...initialUser, enabled: !!checked })
          }
        />
        <label className="font-medium text-sm">Enabled</label>
      </div>
      <Button
        type="submit"
        className="bg-primary-600 hover:bg-primary-700 shadow mt-2 focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 w-full font-semibold text-white text-base"
        disabled={loading}
      >
        {submitLabel}
      </Button>
      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
    </form>
  );
}

// UpdatePasswordDialog component
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

export const UsersTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    enabled: true,
    groups: []
  });
  const [passwordDialogUser, setPasswordDialogUser] = useState<User | null>(
    null
  );
  const [editingUserForm, setEditingUserForm] = useState<Partial<User> | null>(
    null
  );

  // API hooks
  const {
    data: usersResponse,
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch: refetchUsers
  } = useGetUsersListQuery();

  const users: User[] = usersResponse?.result || [];

  const { data: groupsResponse, isLoading: isGroupsLoading } =
    useGetGroupsListQuery();
  const groupOptions = groupsResponse?.result || [];

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const { data: editingUserData, isLoading: isEditingUserLoading } =
    useGetUserByIdQuery(editingUserId!, { skip: !editingUserId });

  // When editingUserData loads, set editingUserForm
  useEffect(() => {
    if (editingUserData?.result) {
      setEditingUserForm(editingUserData.result);
    }
  }, [editingUserData]);

  const filteredUsers = users.filter((user) => {
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const groups = Array.isArray(user.groups)
      ? user.groups.map((g) => g.name).join(", ")
      : "";
    return (
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      groups.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddUser = () => {
    // Prepare payload for user creation
    const payload = {
      username: newUser.username ?? "",
      enabled: newUser.enabled ?? true,
      firstName: newUser.firstName ?? "",
      lastName: newUser.lastName ?? "",
      email: newUser.email ?? "",
      groups: newUser.groups || [],
      credentials: {
        type: "password",
        temporary: true,
        value: "Picarro@1234"
      }
    };

    console.log(payload);
    setIsAddingUser(false);
    createUser(payload);
  };

  const handleUpdateUser = async () => {
    if (editingUserId && editingUserForm) {
      try {
        await updateUser({
          userId: editingUserId,
          data: editingUserForm as User
        }).unwrap();
        setEditingUserId(null);
        refetchUsers();
      } catch (err) {
        // handle error (show toast, etc)
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser({ userId }).unwrap();
        refetchUsers();
      } catch (err) {
        // handle error (show toast, etc)
      }
    }
  };

  // Remove getRoleBadgeClass and all role-related UI

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="top-2.5 left-2 absolute w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 shadow focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2">
              <UserPlus size={16} />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <UserForm
              initialUser={newUser}
              onChange={setNewUser}
              onSubmit={handleAddUser}
              submitLabel="Add User"
              groupsOptions={groupOptions}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <CardTitle className="mb-6">User Management</CardTitle>
        <div className="space-y-4">
          {isUsersLoading ? (
            <div className="py-12 text-muted-foreground text-base text-center">
              Loading users...
            </div>
          ) : isUsersError ? (
            <div className="py-12 text-red-500 text-base text-center">
              Failed to load users.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-muted-foreground text-base text-center">
              No users found.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="items-center gap-4 grid grid-cols-[1fr,auto,auto] bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : user.username}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {user.email || user.username}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs">
                    <span
                      className={`px-2 py-1 rounded-full font-medium ${
                        user.enabled
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {user.enabled ? "Enabled" : "Disabled"}
                    </span>
                    {Array.isArray(user.groups) &&
                      user.groups.map((g) => (
                        <span
                          key={g.id}
                          className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full font-medium text-gray-800 dark:text-gray-200"
                        >
                          {g.name}
                        </span>
                      ))}
                    {user.access.edit && (
                      <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full font-medium text-blue-800 dark:text-blue-200">
                        Can Edit
                      </span>
                    )}
                    {user.access.delete && (
                      <span className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded-full font-medium text-red-800 dark:text-red-200">
                        Can Delete
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {/* No roles, so nothing here */}
                </div>
                <div className="flex items-center gap-2">
                  <Dialog
                    open={editingUserId === user.id}
                    onOpenChange={(open) =>
                      setEditingUserId(open ? user.id : null)
                    }
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 w-8 h-8"
                      onClick={() => setEditingUserId(user.id)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                      </DialogHeader>
                      {isEditingUserLoading ? (
                        <div className="py-8 text-muted-foreground text-center">
                          Loading...
                        </div>
                      ) : editingUserForm ? (
                        <UserForm
                          initialUser={editingUserForm}
                          onChange={setEditingUserForm}
                          onSubmit={handleUpdateUser}
                          submitLabel={
                            isUpdating ? "Updating..." : "Update User"
                          }
                          loading={isUpdating}
                          groupsOptions={groupOptions}
                        />
                      ) : null}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 w-8 h-8"
                    onClick={() => setPasswordDialogUser(user)}
                    title="Update Password"
                  >
                    <KeyRound size={16} />
                  </Button>
                  <UpdatePasswordDialog
                    open={passwordDialogUser?.id === user.id}
                    user={passwordDialogUser}
                    onOpenChange={(open) =>
                      setPasswordDialogUser(open ? user : null)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-50 p-0 w-8 h-8 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
