import { ChevronsUpDown, LogOut, User2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useLogoutMutation } from "@/utils";

export function NavUser({
  user
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}) {
  const { state } = useSidebar();
  const { logout } = useAuth();
  const expanded = state === "expanded";
  const refreshToken = localStorage.getItem("refresh_token");

  const [logoutHandler] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      logoutHandler({ refresh_token: refreshToken })
        .unwrap()
        .then(() => {
          logout();
        });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`hover:bg-inherit mx-0 px-2
                ${
                  expanded
                    ? "gap-2 items-center"
                    : "justify-center items-center"
                }`}
            >
              <Avatar className="rounded-lg w-8 h-8">
                <AvatarFallback className="bg-white/10 rounded-lg">
                  <User2 className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              {expanded && (
                <span className="font-semibold text-sm">{user.name}</span>
              )}
              {expanded && <ChevronsUpDown className="ml-auto size-4" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-neutral-900/90 shadow-xl backdrop-blur-[2px] border border-neutral-800 rounded-xl w-[--radix-dropdown-menu-trigger-width] min-w-48"
            side={"top"}
            // align="end"
            // sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-3 py-3 text-white text-sm text-left">
                <div className="flex-1 grid text-sm text-left leading-tight">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-300/40" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="px-3 py-4 text-white"
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
