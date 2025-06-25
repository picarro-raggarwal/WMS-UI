import React from "react";
import { cn } from "@/lib/utils";
export const EmptyStateInfo = ({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description: React.ReactNode | string;
  icon: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "border border-dashed border-gray-200 dark:border-neutral-700 rounded-lg",
        className
      )}>
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gray-50 dark:bg-neutral-800 p-2 rounded-full mb-3">
          {React.cloneElement(icon as React.ReactElement, { className: "size-6 text-gray-400" })}
        </div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
      </div>
    </div>
  );
};
