function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse rounded-xl bg-neutral-100 ${className}`} {...props} />;
}

function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-[96rem] px-8 lg:px-12 py-6 w-full">
      <div className="pt-0 group">
        <div className="flex justify-between items-center">
          <Skeleton className="w-[300px] h-[30px] bg-neutral-200 dark:bg-neutral-700 rounded-xl mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-6">
        <Skeleton className="col-span-3 w-full h-[60px] rounded-full my-5 px-6 pb-2 bg-white dark:bg-neutral-800">
          <div className="space-y-2">
            <div className="border-neutral-100 py-3">
              <Skeleton className="w-[300px] h-[20px] bg-neutral-200 dark:bg-neutral-700 rounded-xl mt-2" />
            </div>
            <div className="border-neutral-100 py-3">
              <Skeleton className="w-[300px] h-[20px] bg-neutral-200 dark:bg-neutral-700 rounded-xl mt-2" />
            </div>
          </div>
        </Skeleton>
        <Skeleton className="col-span-2 w-full h-[300px] rounded-full my-5 px-6 pb-2 bg-white dark:bg-neutral-800">
          <div className="border-neutral-200 py-3">
            <Skeleton className="w-[300px] h-[20px] bg-neutral-200 dark:bg-neutral-700 rounded-xl mt-2" />
          </div>
        </Skeleton>
      </div>
    </div>
  );
}

export { Skeleton, HomeSkeleton };
