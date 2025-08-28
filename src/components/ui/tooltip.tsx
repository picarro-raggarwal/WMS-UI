import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2 z-50 bg-neutral-900 dark:bg-neutral-950 shadow-lg px-3 py-2 dark:border-neutral-800 rounded-xl overflow-hidden text-neutral-100 dark:text-neutral-50 text-sm animate-in data-[state=closed]:animate-out fade-in-0 data-[state=closed]:fade-out-0",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
