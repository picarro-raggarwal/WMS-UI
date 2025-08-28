import { cn } from "@/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-neutral-100 dark:bg-neutral-800 rounded-md animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
