const SingleChartSkeleton = () => {
  return (
    <div className="space-y-4 bg-white shadow-card p-6 rounded-xl w-full">
      <div role="status" className="w-3/4 animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 mb-4 rounded-md w-full h-16"></div>
        <div className="bg-gray-200 dark:bg-gray-700 mb-2.5 rounded-md max-w-full h-4"></div>
        <div className="bg-gray-200 dark:bg-gray-700 mb-2.5 rounded-md h-4"></div>
        <div className="bg-gray-200 dark:bg-gray-700 mb-2.5 rounded-full h-4"></div>
        <div className="bg-gray-200 dark:bg-gray-700 mb-2.5 rounded-full h-4"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default SingleChartSkeleton;
