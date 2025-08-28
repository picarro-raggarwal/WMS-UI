import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex items-center w-full touch-none select-none",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative bg-neutral-100 dark:bg-neutral-800 rounded-full w-full h-2 overflow-hidden grow">
      <SliderPrimitive.Range className="absolute bg-neutral-900 dark:bg-neutral-50 h-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block bg-white dark:bg-neutral-950 disabled:opacity-50 border-2 border-neutral-900 dark:border-neutral-50 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-300 ring-offset-white focus-visible:ring-offset-2 dark:ring-offset-neutral-950 w-5 h-5 transition-colors disabled:pointer-events-none" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
