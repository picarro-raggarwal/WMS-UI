import * as React from "react";

import { cn } from "@/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex bg-white dark:bg-neutral-950 disabled:opacity-50 px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 dark:focus-visible:ring-neutral-300 ring-offset-white focus-visible:ring-offset-1 dark:ring-offset-neutral-950 w-full min-h-[80px] dark:placeholder:text-neutral-400 placeholder:text-neutral-500 md:text-sm text-base disabled:cursor-not-allowed",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
