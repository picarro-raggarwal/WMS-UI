import { Button } from "@/components/ui/button";
import { formatLabel } from "@/utils";

interface SimpleStatsBarProps {
  label: string;
  mean: number;
  stdDev: number;
  unit: string;
  currentValue: number;
  onClick?: () => void;
}

export const SimpleStatsBar = ({
  label,
  mean,
  stdDev,
  unit,
  onClick,
  currentValue,
}: SimpleStatsBarProps) => (
  <div className="flex items-center gap-6 px-4 py-5 !pb-3 -m-6 mb-4 border-b border-dashed border-neutral-200 dark:border-neutral-700 bg-white rounded-t-xl dark:bg-neutral-800">
    <Button
      variant="ghost"
      className="gap-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3 -ml-1 h-full"
      onClick={onClick}>
      <span className="flex flex-col items-start">
        <p className="text-xs text-neutral-600 dark:text-neutral-300">Data Source</p>
        <p className="whitespace-nowrap text-xl font-bold md:text-2xl tracking-tight text-black dark:text-white">
          {formatLabel(label)}
        </p>
      </span>
    </Button>

    <div className="flex tabular-nums divide-x divide-dashed divide-neutral-200 dark:divide-neutral-700 items-center justify-between gap-6 text-sm dark:text-neutral-300 border-l border-dashed border-neutral-200 dark:border-neutral-700 pl-6">
      <div className="flex flex-col items-start">
        <span className="text-xs text-neutral-600 dark:text-neutral-300">Value</span>
        <span className="tabular-nums whitespace-nowrap text-lg font-bold md:text-xl tracking-tight md:leading-9 text-black dark:text-white">
          {currentValue.toFixed(2)}
          {unit}
        </span>
      </div>
      <div className="flex flex-col items-start pl-6">
        <span className="text-xs text-neutral-600 dark:text-neutral-300">Mean:</span>
        <span className="tabular-nums whitespace-nowrap text-lg font-bold md:text-xl tracking-tight md:leading-9 text-black dark:text-white">
          {mean.toFixed(2)}
          {unit}
        </span>
      </div>
      <div className="flex flex-col items-start pl-6">
        <span className="text-xs text-neutral-600 dark:text-neutral-300">σ:</span>
        <span className="tabular-nums whitespace-nowrap text-lg font-bold md:text-xl tracking-tight md:leading-9 text-black dark:text-white">
          {stdDev.toFixed(2)}
          {/* {unit} */}
        </span>
      </div>
    </div>
  </div>
);
