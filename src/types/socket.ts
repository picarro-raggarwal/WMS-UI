/**
 * Type definitions for Socket.io data
 */

// Subcomponent data
export interface SubcomponentData {
  timestamp: number;
  [key: string]: unknown;
}

// Driver alert
export interface DriverAlert {
  timestamp: number;
  alertId: string;
  message: string;
  severity: "info" | "warning" | "error";
  [key: string]: unknown;
}

// Fenceline job state
export interface FencelineJobState {
  job_id: number;
  state: string;
  recipe_id: number;
  progress: number;
  [key: string]: unknown;
}

// WebSocket data types

export interface WebSocketJobData {
  job_id: number;
  job_type: string | null;
  job_name: string | null;
  elapsed_time_seconds: number;
  start_time: number;
  total_steps: number;
  total_expected_duration_seconds: number;
  recipe_name: string | null;
}

export interface WebSocketJobStateData {
  state: string;
  current_job?: WebSocketJobData;
}

export interface DataUpdatePayload {
  object: string;
  event: string;
  event_time: number;
  version: number;
  data: {
    connected: boolean;
    serial_number: string | null;
    device_data: Record<string, unknown>;
  };
  source: string;
  metadata: {
    published_at: number;
    received_at: number;
  };
  type: number;
  export: boolean;
}

export interface AnemometerData extends DataUpdatePayload {
  object: "anemometer_data";
  data: {
    connected: boolean;
    serial_number: string;
    device_data: {
      latitude: string;
      longitude: string;
      altitude_m: string;
      node_letter: string;
      "wind_speed_m/s": number;
      wind_direction_deg: number;
      pressure_mmHg: number;
      relative_humidity_pct: number;
      temperature_C: number;
      dew_point_C: number;
      compass_heading_deg: number;
      timestamp_s: number;
      voltage_V: number;
      x_tilt_measurement_deg: number;
      y_tilt_measurement_deg: number;
      heater_status: number;
      sensor_status: number;
      wind_status: number;
      "wind_u_component_vector_m/s": number;
      "wind_v_component_vector_m/s": number;
      heater_errors: string | null;
      sensor_errors: string | null;
      wind_errors: string | null;
    };
  };
}

export interface TemperatureControllerData extends DataUpdatePayload {
  object: "temperature_controller_data";
  data: {
    connected: boolean;
    serial_number: string;
    device_data: {
      controller_type: string;
      serial_number: number;
      analog_input_value: number;
      device_status: string;
      input_error: string | null;
      alarm_state: string;
      power: number;
      set_point: number;
      openloop_status: number;
    };
  };
}

export interface CatalyticConverterData extends DataUpdatePayload {
  object: "catalytic_converter_data";
  data: {
    connected: boolean;
    serial_number: string;
    device_data: {
      serial_number: number;
      analog_input_value: number;
      device_status: string;
      input_error: string;
      alarm_state: string;
      power: string;
      set_point: number;
      openloop_status: string;
    };
  };
}

export interface MfcData extends DataUpdatePayload {
  object: "mfc_data";
  data: {
    connected: boolean;
    serial_number: string | null;
    device_data: {
      mfc_id: string;
      pressure: string;
      temperature: string;
      v_flow: string;
      m_flow: string;
      set_point: string;
      valve_drive_perc: string;
      gas_id: string;
      timestamp: number;
      mfc_conc_invalid_flag: number;
      flow_rate_flag: number;
    };
  };
}

export interface HvacSystemData extends DataUpdatePayload {
  object: "hvac_system_data";
  data: {
    connected: boolean;
    serial_number: string | null;
    device_data: {
      cabinet_temperature: number;
      ac_temperature: number;
      heater_temperature: number;
    };
  };
}

export interface GasTankData extends DataUpdatePayload {
  object: "gas_tank_data";
  // We'll define the device_data structure when we see an example payload
}

// Processed Alerts WebSocket types
export interface ProcessedAlert {
  driver_name: string;
  alarm_name: string;
  severity: number;
  first_timestamp: number;
  last_timestamp: number;
  alert_state: string;
  repeat_count: number;
  error: string;
  published_count: number;
}

export interface AlertOriginalMetadata {
  analyzer_name?: string;
  analyzer_model?: string;
  cavity_temperature?: number;
  cavity_pressure?: number;
  error_message?: string;
  [key: string]: unknown;
}

export interface AlertRuleApplied {
  escalated: boolean;
  repeat_count: number;
  [key: string]: unknown;
}

export interface AlertProcessedEventData {
  processed_alert: ProcessedAlert;
  original_metadata: AlertOriginalMetadata;
  error: string;
  rule_applied: AlertRuleApplied;
}

export interface AlertProcessedEvent {
  object: "processed_alerts";
  event: "alert_processed";
  event_time: number;
  version: number;
  data: AlertProcessedEventData;
  source: string;
  metadata: {
    published_at: number;
    received_at: number;
  };
  type: number;
  export: boolean;
}
