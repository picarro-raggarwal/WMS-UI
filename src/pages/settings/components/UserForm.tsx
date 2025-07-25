import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

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

function UserForm({
  initialUser,
  onSubmit,
  submitLabel,
  onChange,
  loading = false,
  groupsOptions,
  apiError
}: {
  initialUser: Partial<User>;
  onSubmit: () => void;
  submitLabel: string;
  onChange: (user: Partial<User>) => void;
  loading?: boolean;
  groupsOptions: Group[];
  apiError?: string;
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
      {apiError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4 text-white" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

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

      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
      <Button
        type="submit"
        className="bg-primary-600 hover:bg-primary-700 shadow mt-2 focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 w-full font-semibold text-white text-base"
        disabled={loading}
      >
        {submitLabel}
      </Button>
    </form>
  );
}

export default UserForm;
