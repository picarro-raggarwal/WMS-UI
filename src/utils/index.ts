// Formatting utilities
export { formatLabel } from "./formatting/textFormatting";
export {
  DATE_FORMAT_OPTIONS,
  formatDate,
  formatDateTime,
  formatTime,
  formatUnixTimestamp,
  TIME_FORMAT_OPTIONS,
  TIME_ONLY_FORMAT_OPTIONS
} from "./formatting/timeFormatting";

// Threshold utilities
export * from "./formatting/thresholdUtils";

// UI utilities
export {
  cn,
  convertTimestampToTimezone,
  cx,
  focusInput,
  focusRing,
  formatters,
  hasErrorInput,
  percentageFormatter
} from "./ui/utils";

// Chart utilities
export {
  AvailableChartColors,
  chartColors,
  constructCategoryColors,
  getColorClassName,
  getGradientColorClassName,
  getYAxisDomain,
  hasOnlyOneValueForKey
} from "./charts/chartUtils";
export type {
  AvailableChartColorsKeys,
  ColorUtility
} from "./charts/chartUtils";

// Hook utilities
export { useOnWindowResize } from "./hooks/useOnWindowResize";
export { default as useScroll } from "./hooks/useScroll";

// API utilities
export {
  authApi,
  useLoginMutation,
  useLogoutMutation,
  useRequiredUpdatePasswordMutation
} from "./api/authAPI";
export type {
  AuthTokenResponse,
  PasswordUpdateRequiredResponse
} from "./api/authAPI";
export { clearAuthData, protectedBaseQuery } from "./api/ProtectedBaseQuery";
