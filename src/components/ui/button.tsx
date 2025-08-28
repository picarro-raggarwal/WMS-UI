import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";
import { Spinner } from "../spinner";
import { Link } from "react-router";

const buttonVariants = cva(
  "active:scale-[0.98] transition ease-in duration-150 will-change-transform inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90",
        primary:
          "bg-primary-500 text-neutral-50 hover:bg-primary-600/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:text-neutral-50 dark:hover:bg-red-900/90",
        outline:
          "border  bg-white hover:bg-neutral-100 hover:text-neutral-900 dark:text-white dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800/80",
        ghost:
          "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        xs: "h-7 rounded-full px-2 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  to?: string;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, className, variant, size, asChild = false, to, loading, disabled, icon, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Set default icon size to 13 if not provided
    let iconWithSize = icon;
    if (icon && React.isValidElement(icon)) {
      // Check if icon has size prop and if not, clone with size 13
      const iconProps = icon.props as { size?: number };
      if (!iconProps.size) {
        iconWithSize = React.cloneElement(icon, { size: 13 } as { size: number });
      }
    }

    const buttonContent = (
      <>
        <span className={`${loading ? "opacity-0" : "flex items-center gap-2"}`}>
          {iconWithSize}
          {children}
        </span>
        {loading ? (
          <span className={`absolute`}>
            <Spinner size="4" />
          </span>
        ) : null}
      </>
    );

    if (to) {
      return (
        <Link
          to={to}
          className={cn(buttonVariants({ variant, size, className }))}
          aria-disabled={disabled ? "true" : "false"}>
          {buttonContent}
        </Link>
      );
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}>
        {buttonContent}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
