import { DATE_TIME_FORMAT } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { format, fromUnixTime, isValid } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

// Tremor focusInput [v0.0.1]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  // border color
  "focus:border-blue-500 focus:dark:border-blue-700"
];

// Tremor focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500"
];

// Tremor hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30"
];

interface CurrencyParams {
  number: number;
  maxFractionDigits?: number;
  currency?: string;
}

interface PercentageParams {
  number: number;
  decimals?: number;
}

interface MillionParams {
  number: number;
  decimals?: number;
}

type FormatterFunctions = {
  currency: (params: CurrencyParams) => string;
  unit: (number: number) => string;
  percentage: (params: PercentageParams) => string;
  million: (params: MillionParams) => string;
};

export const formatters: FormatterFunctions = {
  currency: ({
    number,
    maxFractionDigits = 2,
    currency = "USD"
  }: CurrencyParams): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: maxFractionDigits
    }).format(number);
  },

  unit: (number: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal"
    }).format(number);
  },

  percentage: ({ number, decimals = 1 }: PercentageParams): string => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  },

  million: ({ number, decimals = 1 }: MillionParams): string => {
    return `${new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number)}M`;
  }
};

export const percentageFormatter = (number: number, decimals = 1) => {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
  const symbol = number > 0 && number !== Infinity ? "+" : "";

  return `${symbol}${formattedNumber}`;
};

export const formatDate = (timestamp: number) => {
  return format(new Date(timestamp), DATE_TIME_FORMAT);
};

/**
 * Converts a Unix timestamp to a formatted date string in the specified timezone
 * @param unixTimestamp - Unix timestamp in seconds (required)
 * @param timezone - IANA timezone identifier (e.g., 'America/New_York', 'Europe/London') (required)
 * @param formatString - Optional date format string (defaults to DATE_TIME_FORMAT)
 * @returns Formatted date string in the specified timezone
 * @throws Error if inputs are invalid
 */
export const convertTimestampToTimezone = (
  unixTimestamp: number,
  timezone: string,
  formatString: string = DATE_TIME_FORMAT
): string => {
  // Validate unix timestamp
  if (typeof unixTimestamp !== "number" || !Number.isFinite(unixTimestamp)) {
    throw new Error("Invalid unix timestamp: must be a finite number");
  }

  // Validate and normalize timezone (remove leading slashes)
  if (typeof timezone !== "string" || timezone.trim() === "") {
    throw new Error("Invalid timezone: must be a non-empty string");
  }

  // Normalize timezone by removing leading slashes (e.g., '/UTC' -> 'UTC')
  const normalizedTimezone = timezone.trim().replace(/^\/+/, "");

  // Convert unix timestamp to Date object
  const date = fromUnixTime(unixTimestamp);

  // Validate the resulting date
  if (!isValid(date)) {
    throw new Error("Invalid unix timestamp: results in an invalid date");
  }

  // Validate timezone by attempting to create a date formatter
  try {
    // Test timezone validity by creating a formatter
    new Intl.DateTimeFormat("en-US", { timeZone: normalizedTimezone });
  } catch (error) {
    throw new Error(
      `Invalid timezone '${timezone}': ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  // Create a date in the target timezone by getting the local time components
  try {
    // Get the date components in the target timezone
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: normalizedTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    const parts = formatter.formatToParts(date);
    const partMap = parts.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as Record<string, string>);

    // Create a new date object representing the local time in the target timezone
    const localDate = new Date(
      parseInt(partMap.year),
      parseInt(partMap.month) - 1, // Month is 0-indexed
      parseInt(partMap.day),
      parseInt(partMap.hour),
      parseInt(partMap.minute),
      parseInt(partMap.second),
      date.getMilliseconds()
    );

    // Format using date-fns with the local time representation
    return format(localDate, formatString);
  } catch (error) {
    throw new Error(
      `Failed to convert timestamp to timezone '${normalizedTimezone}': ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
