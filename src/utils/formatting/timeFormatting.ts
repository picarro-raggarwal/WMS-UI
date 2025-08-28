// TODO: Replace with context-based timezone and format preferences in the future
export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
};

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
};

export const TIME_ONLY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
};

const dateTimeFormatter = new Intl.DateTimeFormat(
  undefined,
  TIME_FORMAT_OPTIONS
);
const dateFormatter = new Intl.DateTimeFormat(undefined, DATE_FORMAT_OPTIONS);
const timeFormatter = new Intl.DateTimeFormat(
  undefined,
  TIME_ONLY_FORMAT_OPTIONS
);

export const formatDateTime = (date: Date): string => {
  return dateTimeFormatter.format(date);
};

export const formatUnixTimestamp = (timestamp: number): string => {
  return dateTimeFormatter.format(new Date(timestamp * 1000));
};

export const formatDate = (date: Date): string => {
  return dateFormatter.format(date);
};

export const formatTime = (date: Date): string => {
  return timeFormatter.format(date);
};
