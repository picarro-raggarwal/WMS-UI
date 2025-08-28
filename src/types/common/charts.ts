// Common chart types and interfaces

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: "line" | "area" | "bar" | "scatter";
}

export interface ChartConfig {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  height?: number;
  width?: number;
}

export interface ChartColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  neutral: string[];
}

export interface ChartTooltip {
  enabled: boolean;
  format?: (value: any, name: string) => string;
  position?: "top" | "bottom" | "left" | "right";
}

export interface ChartAxis {
  type: "number" | "category" | "time";
  label?: string;
  min?: number;
  max?: number;
  tickCount?: number;
  format?: (value: any) => string;
}

// Wind rose specific types
export type WindDirection =
  | "N"
  | "NNE"
  | "NE"
  | "ENE"
  | "E"
  | "ESE"
  | "SE"
  | "SSE"
  | "S"
  | "SSW"
  | "SW"
  | "WSW"
  | "W"
  | "WNW"
  | "NW"
  | "NNW";

export interface WindRoseData {
  direction: WindDirection;
  speed: number;
  frequency: number;
  timestamp: number;
}

export interface ChartData {
  timestamp: number;
  value: number;
}

export interface WindRoseConfig {
  directions: WindDirection[];
  speedBins: number[];
  colors: string[];
}
