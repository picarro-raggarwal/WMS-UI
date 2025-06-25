import { Badge, ChevronRight, type LucideIcon } from "lucide-react";
import { useLocation } from "react-router";
import { motion } from "framer-motion";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router";
import { useLocalStorage } from "@mantine/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import NumberFlow from "@number-flow/react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    notification?: number;
    tooltip?: string;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();

  const [sidebarOpenLocalStorage] = useLocalStorage({
    key: "sidebar:state",
  });
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            item.url === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.url);

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem data-active={isActive} className="relative">
                {isActive && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute left-[-16px] top-0 h-full w-[3px] bg-[#3ab23a] rounded-r-lg"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                  />
                )}
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link to={item.url} className="flex items-center relative">
                    <item.icon />
                    <span
                      className={
                        sidebarOpenLocalStorage ? "opacity-100" : "opacity-0 pointer-events-none"
                      }>
                      {item.title}
                    </span>

                    {item.notification !== undefined && item.notification > 0 && item.tooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`${
                              !sidebarOpenLocalStorage ? "absolute rounded-full" : "rounded-md"
                            } top-0 right-0 text-[11px] px-1 hover:scale-[1.02] bg-red-600 !text-white font-medium size-5 flex items-center justify-center`}>
                            <NumberFlow
                              value={item.notification}
                              format={{ notation: "compact" }}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-900 text-white text-xs">
                          {item.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </Link>
                </SidebarMenuButton>

                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubItemActive = location.pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title} className="relative">
                              {isSubItemActive && (
                                <motion.span
                                  layoutId="bubble"
                                  className="absolute left-[-16px] top-0 h-full w-[4px] bg-primary-500 rounded-r-lg"
                                  transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                                />
                              )}
                              <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
