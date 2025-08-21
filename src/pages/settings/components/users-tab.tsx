import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  KeyRound,
  Loader2,
  Pencil,
  Search,
  Trash2,
  UserPlus
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetGroupsListQuery,
  useGetUserByIdQuery,
  useGetUsersListQuery,
  useUpdateUserMutation
} from "../data/user-management.slice";
import UpdatePasswordDialog from "./UpdatePasswordDialog";
import UserForm from "./UserForm";

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

// Remove UserForm and UpdatePasswordDialog component implementations from this file

const emptyUserState: Partial<User> = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  enabled: true,
  groups: []
};

export const UsersTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>(emptyUserState);
  const [passwordDialogUser, setPasswordDialogUser] = useState<User | null>(
    null
  );
  const [editingUserForm, setEditingUserForm] = useState<Partial<User> | null>(
    null
  );
  const [addUserApiError, setAddUserApiError] = useState<string>("");
  const [editUserApiError, setEditUserApiError] = useState<string>("");
  const [deleteDialogUser, setDeleteDialogUser] = useState<User | null>(null);

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

  const {
    data: editingUserData,
    error: editingUserError,
    isLoading: isEditingUserLoading,
    isFetching: isEditingUserFetching,
    isError: isEditingUserError
  } = useGetUserByIdQuery(editingUserId!, { skip: !editingUserId });

  // When editingUserData loads, set editingUserForm
  useEffect(() => {
    if (
      editingUserData?.result &&
      !isEditingUserFetching &&
      !isEditingUserError &&
      editingUserId
    ) {
      setEditingUserForm(editingUserData.result);
    } else if (editingUserError) {
      // If there's an error, keep the form empty but don't clear it
      setEditingUserForm(null);
    }
  }, [
    editingUserData,
    editingUserError,
    isEditingUserFetching,
    isEditingUserError
  ]);

  useEffect(() => {
    if (editingUserError) {
      const errorMessage =
        (editingUserError as any).data?.error_description ||
        (editingUserError as any).data?.message ||
        "Failed to load user.";
      setEditUserApiError(errorMessage);
    }
  }, [editingUserError]);

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
      groups: (newUser.groups || []).map((g) => ({
        ...g,
        attributes: {},
        subGroups: [],
        roles: [{}]
      })),
      credentials: {
        type: "password",
        temporary: true,
        value: "admin"
      },
      emailVerified: true
    };

    setAddUserApiError("");
    createUser(payload)
      .unwrap()
      .then(() => {
        toast.success("User created successfully.");
        setNewUser(emptyUserState);
        setIsAddingUser(false);
        setAddUserApiError("");
        refetchUsers();
      })
      .catch((err) => {
        setAddUserApiError(
          err?.data?.description ||
            err?.data?.message ||
            "Failed to create user."
        );
      });
  };

  const handleUpdateUser = async () => {
    if (editingUserId && editingUserForm) {
      setEditUserApiError("");
      try {
        await updateUser({
          userId: editingUserId,
          data: editingUserForm as User
        })
          .unwrap()
          .then(() => {
            toast.success("User updated successfully.");
            setEditingUserId(null);
            setEditUserApiError("");
          });
      } catch (err: any) {
        setEditUserApiError(
          err?.data?.description ||
            err?.data?.message ||
            "Failed to update user."
        );
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser({ userId })
        .unwrap()
        .then(() => {
          toast.success("User deleted successfully.");
          refetchUsers();
        });
      setEditingUserId(null);
      setPasswordDialogUser(null);
      setDeleteDialogUser(null);
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardTitle className="flex items-center gap-2 text-lg">
          User Management
        </CardTitle>

        <div className="flex items-center gap-4 my-4">
          <div className="relative flex-1">
            <Search className="top-[calc(50%-9px)] left-3 z-10 absolute w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Dialog
            open={isAddingUser}
            onOpenChange={(open) => {
              if (!open) {
                setNewUser(emptyUserState);
              } else {
                setEditingUserId(null);
                setEditingUserForm(null);
              }
              setAddUserApiError("");
              setIsAddingUser(open);
            }}
          >
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
                submitLabel={isCreating ? "Adding..." : "Add User"}
                loading={isCreating}
                groupsOptions={groupOptions}
                apiError={addUserApiError}
                existingUsers={users}
              />
            </DialogContent>
          </Dialog>
        </div>

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
                    @{user.username} • {user.email || "No email"}
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
                    {Array.isArray(user.groups) && user.groups.length > 0 ? (
                      user.groups.map((g) => (
                        <span
                          key={g.id}
                          className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full font-medium text-blue-800 dark:text-blue-200"
                        >
                          {g.name}
                        </span>
                      ))
                    ) : (
                      <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full font-medium text-gray-800 dark:text-gray-200">
                        No groups
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
                    onOpenChange={(open) => {
                      if (!open) {
                        setEditUserApiError("");
                        setEditingUserForm(null);
                        setEditingUserId(null);
                      } else {
                        setEditingUserId(user.id);
                      }
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-0 w-8 h-8 ${
                        !user.access.edit ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => setEditingUserId(user.id)}
                      disabled={!user.access.edit}
                      title={
                        !user.access.edit ? "No edit permission" : "Edit user"
                      }
                    >
                      <Pencil size={16} />
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          Edit User
                          <span className="text-muted-foreground text-xs">
                            {isEditingUserFetching && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                          </span>
                        </DialogTitle>
                      </DialogHeader>
                      {isEditingUserLoading ? (
                        <div className="py-8 text-muted-foreground text-center">
                          Loading...
                        </div>
                      ) : (
                        <UserForm
                          initialUser={editingUserForm || {}}
                          onChange={setEditingUserForm}
                          onSubmit={handleUpdateUser}
                          submitLabel={
                            isUpdating ? "Updating..." : "Update User"
                          }
                          loading={isUpdating}
                          groupsOptions={groupOptions}
                          apiError={editUserApiError}
                          existingUsers={users}
                        />
                      )}
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
                    className={`p-0 w-8 h-8 ${
                      !user.access.delete
                        ? "opacity-50 cursor-not-allowed text-gray-400"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                    }`}
                    onClick={() => setDeleteDialogUser(user)}
                    disabled={!user.access.delete || isDeleting}
                    title={
                      !user.access.delete
                        ? "No delete permission"
                        : "Delete user"
                    }
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDialogUser}
        onOpenChange={(open) => {
          if (!open) setDeleteDialogUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {deleteDialogUser && (
              <span>
                Are you sure you want to delete user{" "}
                <b>{deleteDialogUser.username}</b>?
              </span>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogUser(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() =>
                deleteDialogUser && handleDeleteUser(deleteDialogUser.id)
              }
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
