import { PanelLeft } from "lucide-react";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

export function FooterToggleSidebar() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <SidebarMenuButton
      size="lg"
      onClick={() => toggleSidebar()}
      className={`!py-1 flex items-center transition-all duration-100  !h-auto hover:bg-transparent ${
        open ? "px-2   " : "px-2 ml-2 "
      }`}>
      <div className="h-8 w-8 rounded-lg bg-white/10   flex items-center justify-center">
        <PanelLeft className={`w-4 h-4 ${open ? "rotate-0" : "rotate-180"}  uration-300`} />
      </div>
      {open && (
        <div className="grid flex-1 text-left text-xs leading-tight ">
          <span
            className={`truncate font-semibold wrap-nowrap ${
              open ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}>
            Minimize
          </span>
        </div>
      )}
    </SidebarMenuButton>
  );
}
