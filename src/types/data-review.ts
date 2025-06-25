interface MetricConfig {
  unit?: string;
  type: "compound" | "hardware" | "system";
  system_metric_card?: boolean;
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

export type ChartDataType = {
  timestamps: number;
  [metric: string]: number | string;
};

export interface ChartData {
  timestamp: number;
  value: number;
}
