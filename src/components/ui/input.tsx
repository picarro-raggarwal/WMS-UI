import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative flex items-center min-w-[10rem] outline-none rounded-lg transition duration-100 border shadow-input bg-white hover:bg-neutral-50 border-neutral-200 hover:border-neutral-300 w-full h-11 dark:bg-neutral-950 dark:border-neutral-800 dark:hover:bg-neutral-900",
          (props.size as string) === "sm" && "h-9",
          className
        )}>
        <input
          type={type}
          className="w-full bg-transparent focus:outline-none focus:ring-0 border-none text-base transition duration-100 py-2 px-3 text-neutral-950 placeholder:text-neutral-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:text-neutral-50 dark:placeholder:text-neutral-400"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
