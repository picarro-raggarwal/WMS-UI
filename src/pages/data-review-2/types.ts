export type WindRoseDirection =
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

export type WindSpeedBinKey =
  | "count_0_2"
  | "count_2_4"
  | "count_4_6"
  | "count_6_8"
  | "count_8_plus";

export type WindRoseData = Partial<
  Record<WindRoseDirection, Partial<Record<WindSpeedBinKey, number>>>
>;

export interface WindData {
  average_wind_speed?: number;
  wind_rose?: WindRoseData;
  calm_occurrences?: number;
  total_occurrences?: number;
  calm_threshold?: number;
}

export interface ChartData {
  timestamps: number;
  [key: string]: number;
}

export interface MetricStats {
  mean: number;
  stdDev: number;
  unit: string;
}

export type Thresholds = {
  warning: number;
  alarm: number;
};

export type ThresholdsConfig = {
  warning: {
    value: number;
    color: string;
    visible: boolean;
  };
  alarm: {
    value: number;
    color: string;
    visible: boolean;
  };
};

export type FormattedData = {
  data: ChartData[];
  mean: number;
  stdDev: number;
  unit: string;
  thresholds?: Thresholds;
};
