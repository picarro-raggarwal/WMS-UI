// Common API response and request types

export interface BaseResponse<T = any> {
  result: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T = any> extends BaseResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Common request types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRangeParams {
  startTime: number;
  endTime: number;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
}

// Common data types
export interface TimestampedData {
  timestamp: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IdentifiableData {
  id: string | number;
}

export interface NamedData {
  name: string;
  displayName?: string;
}

export interface StatusData {
  status: "active" | "inactive" | "pending" | "error";
  enabled?: boolean;
}

// Common metric types
export interface MetricConfig {
  unit?: string;
  type: string;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
}

export interface MetricsResponse {
  metrics: {
    [key: string]: MetricConfig;
  };
}

export interface MetricOption {
  id: string;
  label: string;
  unit: string;
  type: string;
  defaultValue?: number;
  color?: string;
}

export interface MetricData {
  value: number;
  unit: string;
  timestamp: number;
}

// Common threshold types
export interface Threshold {
  warning: number;
  alarm: number;
  unit: string;
}

export interface ThresholdConfig extends Threshold {
  metric: string;
  type: "compound" | "hardware" | "system";
}
