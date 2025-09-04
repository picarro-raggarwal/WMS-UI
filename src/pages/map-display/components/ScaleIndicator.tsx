interface ScaleIndicatorProps {
  containerSize: { width: number; height: number } | null;
  imgSize: { width: number; height: number } | null;
}

export const ScaleIndicator = ({
  containerSize,
  imgSize
}: ScaleIndicatorProps) => {
  // Static scale configuration
  const scaleBarWidth = 100; // Fixed width in pixels
  const scaleBarUnits = 50; // Fixed coordinate units
  const realWorldDistance = 5; // Fixed real-world distance in meters

  return (
    <div className="absolute bottom-4 left-4 z-[99999] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-neutral-300 dark:border-neutral-700 rounded-lg p-3 shadow-lg">
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex items-center space-x-1">
          <div
            className="h-2 bg-neutral-800 dark:bg-neutral-200 rounded-l-full"
            style={{ width: `${scaleBarWidth}px` }}
          ></div>
          <div className="w-1 h-2 bg-neutral-800 dark:bg-neutral-200"></div>
        </div>
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {scaleBarUnits} coordinate units ≈ {realWorldDistance}m
        </span>
      </div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        Scale: 1:10
      </div>
    </div>
  );
};
