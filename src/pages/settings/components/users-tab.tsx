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
import {
  KeyRound,
  Pencil,
  Search,
  Shield,
  Trash2,
  UserPlus
} from "lucide-react";
import { useState } from "react";

type UserRole = "Customer" | "Picarro Service" | "Admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole[];
  lastActive?: string;
}

// Mock data - replace with actual API call
const mockUsers: User[] = [
  {
    id: "1",
    name: "Bob Wilson",
    email: "bob@admin.com",
    role: ["Admin"],
    lastActive: "2024-03-13T09:20:00"
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@picarro.com",
    role: ["Picarro Service"],
    lastActive: "2024-03-15T10:30:00"
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane@customer.com",
    role: ["Customer"],
    lastActive: "2024-03-14T15:45:00"
  }
];

// Reusable UserForm component for Add/Edit User
function UserForm({
  initialUser,
  onSubmit,
  submitLabel,
  onChange,
  loading = false
}: {
  initialUser: Partial<User>;
  onSubmit: () => void;
  submitLabel: string;
  onChange: (user: Partial<User>) => void;
  loading?: boolean;
}) {
  const roles: UserRole[] = ["Admin", "Picarro Service", "Customer"];
  const selectedRoles = initialUser.role || [];

  if (!Array.isArray(selectedRoles)) {
    console.error("User role must be an array");
    return null;
  }

  const handleRoleChange = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      onChange({
        ...initialUser,
        role: selectedRoles.filter((r) => r !== role)
      });
    } else {
      onChange({ ...initialUser, role: [...selectedRoles, role] });
    }
  };

  const selectedLabel =
    selectedRoles.length > 0 ? selectedRoles.join(", ") : "Select roles";

  return (
    <div className="flex flex-col gap-2">
      <div className="space-y-2">
        <label className="font-medium text-sm">Name</label>
        <Input
          value={initialUser.name || ""}
          onChange={(e) => onChange({ ...initialUser, name: e.target.value })}
          placeholder="Enter name"
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
        <label className="font-medium text-sm">Roles</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-between w-full"
              type="button"
            >
              <span className="font-normal">{selectedLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px]">
            {roles.map((role) => (
              <DropdownMenuItem
                key={role}
                className="flex items-center space-x-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  handleRoleChange(role);
                }}
              >
                <Checkbox checked={selectedRoles.includes(role)} />
                <span>{role}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button
        onClick={onSubmit}
        className="bg-primary-600 hover:bg-primary-700 shadow mt-2 focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 w-full font-semibold text-white text-base"
        disabled={loading}
      >
        {submitLabel}
      </Button>
    </div>
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

  const handleClose = () => {
    setNewPassword("");
    setRetypePassword("");
    setPasswordError("");
    onOpenChange(false);
  };

  const handleUpdate = () => {
    if (!newPassword || !retypePassword) {
      setPasswordError("Both fields are required.");
    } else if (newPassword !== retypePassword) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError("");
      handleClose();
      // Here you would call your API to update the password
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
            onClick={handleUpdate}
          >
            Update Password
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const UsersTab = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: ["Customer"]
  });
  const [passwordDialogUser, setPasswordDialogUser] = useState<User | null>(
    null
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddUser = () => {
    if (
      newUser.name &&
      newUser.email &&
      newUser.role &&
      newUser.role.length > 0
    ) {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        lastActive: new Date().toISOString()
      };
      setUsers([...users, user]);
      setNewUser({ name: "", email: "", role: ["Customer"] });
      setIsAddingUser(false);
    }
  };

  const handleUpdateUser = () => {
    if (editingUser && editingUser.role && editingUser.role.length > 0) {
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Picarro Service":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Customer":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

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
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <CardTitle className="mb-6">User Management</CardTitle>
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
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
                  <div className="font-medium">{user.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {user.email}
                  </div>
                  {user.lastActive && (
                    <div className="mt-1 text-muted-foreground text-xs">
                      Last active: {new Date(user.lastActive).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {user.role.map((r) => (
                    <span
                      key={r}
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleBadgeClass(
                        r
                      )}`}
                    >
                      <Shield size={12} />
                      {r}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Dialog
                    open={editingUser?.id === user.id}
                    onOpenChange={(open) => setEditingUser(open ? user : null)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 w-8 h-8"
                      onClick={() => setEditingUser(user)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                      </DialogHeader>
                      <UserForm
                        initialUser={editingUser || {}}
                        onChange={(user) =>
                          setEditingUser({ ...editingUser!, ...user })
                        }
                        onSubmit={handleUpdateUser}
                        submitLabel="Update User"
                      />
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
