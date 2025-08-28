import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/utils";

const toggleVariants = cva(
  "inline-flex justify-center items-center gap-2 data-[state=on]:bg-neutral-100 hover:bg-neutral-100 dark:data-[state=on]:bg-neutral-800 dark:hover:bg-neutral-800 disabled:opacity-50 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-300 ring-offset-white focus-visible:ring-offset-2 dark:ring-offset-neutral-950 [&_svg]:size-4 font-medium data-[state=on]:text-neutral-900 hover:text-neutral-500 dark:data-[state=on]:text-neutral-50 dark:hover:text-neutral-400 text-sm transition-colors [&_svg]:pointer-events-none disabled:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-neutral-200 bg-transparent hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
      },
      size: {
        default: "h-10 px-3 min-w-10",
        sm: "h-9 px-2.5 min-w-9",
        lg: "h-11 px-5 min-w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
