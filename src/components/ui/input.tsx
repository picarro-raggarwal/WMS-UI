import * as React from "react";

import { cn } from "@/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative flex items-center bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 shadow-input border border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 rounded-lg outline-none w-full min-w-[10rem] h-11 transition duration-100",
          (props.size as string) === "sm" && "h-9",
          className
        )}
      >
        <input
          type={type}
          className="bg-transparent disabled:opacity-50 px-3 py-2 border-none focus:outline-none focus:ring-0 w-full text-neutral-950 dark:placeholder:text-neutral-400 dark:text-neutral-50 placeholder:text-neutral-500 md:text-sm text-base transition duration-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:cursor-not-allowed [appearance:textfield]"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
