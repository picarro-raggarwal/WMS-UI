// Color utilities for live data cards
// Standardized colors using Tailwind classes

/**
 * Get background color class for cards
 * Returns Tailwind classes with opacity modifiers for lighter shades
 */
export const getBgColorClass = (
  status: 0 | 1 | 2 | 3,
  isActive: boolean = true
): string => {
  // If inactive, return slate color
  if (!isActive) {
    return "bg-slate-100 dark:bg-slate-600";
  }

  switch (status) {
    case 0:
      // Normal - using primary color
      return "bg-primary-100 dark:bg-primary-600/60";
    case 1:
      // Warning - amber/yellow
      return "bg-amber-200 dark:bg-amber-600/60";
    case 2:
      // Critical - red
      return "bg-red-200 dark:bg-red-600/60";
    case 3:
      // Flow error - cyan
      return "bg-cyan-100 dark:bg-cyan-800/60";
    default:
      return "bg-neutral-200 dark:bg-neutral-600";
  }
};

/**
 * Get text color class for status text
 */
export const getStatusTextColorClass = (status: 0 | 1 | 2 | 3): string => {
  switch (status) {
    case 0:
      return "text-primary-600 dark:text-primary-400";
    case 1:
      return "text-amber-600 dark:text-amber-400";
    case 2:
      return "text-red-600 dark:text-red-400";
    case 3:
      return "text-cyan-600 dark:text-cyan-400";
    default:
      return "text-neutral-600 dark:text-neutral-400";
  }
};

/**
 * Get status bar color class
 */
export const getStatusBarColorClass = (status: 0 | 1 | 2 | 3): string => {
  switch (status) {
    case 0:
      return "bg-primary-500 dark:bg-primary-500";
    case 1:
      return "bg-amber-500 dark:bg-amber-500";
    case 2:
      return "bg-red-500 dark:bg-red-500";
    case 3:
      return "bg-cyan-500 dark:bg-cyan-500";
    default:
      return "bg-neutral-500 dark:bg-neutral-500";
  }
};
