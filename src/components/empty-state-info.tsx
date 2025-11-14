import { cn } from "@/utils";
import React from "react";
export const EmptyStateInfo = ({
  title,
  description,
  icon,
  className,
  iconClassName
}: {
  title: string;
  description: React.ReactNode | string;
  icon: React.ReactNode;
  className?: string;
  iconClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "border border-gray-200 dark:border-neutral-700 border-dashed rounded-lg",
        className
      )}
    >
      <div className="flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-gray-50 dark:bg-neutral-800 mb-3 p-2 rounded-full">
          {React.cloneElement(icon as React.ReactElement, {
            className: cn("size-6 text-gray-400", iconClassName)
          })}
        </div>
        <h3 className="mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
          {title}
        </h3>
        <p className="max-w-xs text-gray-500 dark:text-gray-400 text-sm">
          {description}
        </p>
      </div>
    </div>
  );
};
