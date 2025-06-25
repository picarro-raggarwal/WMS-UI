import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border border-neutral-200 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:mt-0.5 [&>svg]:text-neutral-950 dark:border-neutral-800 dark:[&>svg]:text-neutral-50",
  {
    variants: {
      variant: {
        default: "bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50",
        warning:
          "bg-neutral-50 border-gray-100 dark:border-neutral-800 dark:bg-neutral-900 [&>svg]:text-yellow-600  dark:[&>svg]:text-yellow-600 [&>h5]:text-yellow-600 dark:[&>h5]:text-yellow-600 [&>p]:text-neutral-800 dark:[&>p]:text-white",
        destructive:
          "bg-red-600 border-red-500 text-white dark:border-red-500 [&>svg]:text-white  dark:border-red-900/50 dark:text-red-900 dark:dark:border-red-900 dark:[&>svg]:text-red-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("font-medium leading-none text-sm", className)} {...props} />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-1 text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
