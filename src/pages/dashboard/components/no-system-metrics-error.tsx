export const NoSystemMetricsError = () => {
  return (
    <div className="flex flex-col gap-2 bg-white -50 ring-1 ring-neutral-500/10 shadow-sm dark:bg-neutral-800 p-4   rounded-lg ">
      <div>
        <div className="flex justify-between items-center">
          <dt className="text-base font-medium text-neutral-800 dark:text-neutral-100 tracking-tight">
            -
          </dt>
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight mt-1 dark:text-white">
            0.00
            <span className="text-sm ml-1 text-neutral-600">00</span>
          </p>
        </div>
      </div>

      <dd className="flex flex-col gap-2">
        <div className="h-2 w-full bg-neutral-200 rounded-full animate-pulse"></div>
      </dd>
    </div>
  );
};
