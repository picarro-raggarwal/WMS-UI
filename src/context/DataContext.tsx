import React, { createContext, useContext } from "react";

interface SystemInfo {
  name: string;
  id: string;
  serialNumber: string;
  manufactureDate: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  ups: {
    percentage: number;
    status: "Armed" | "Disarmed";
  };
  status: {
    anemometer: "normal" | "warning" | "critical";
    hvac: "normal" | "warning" | "critical";
    analyzer: "normal" | "warning" | "critical";
    sampleHandler: "normal" | "warning" | "critical";
    cpu: "normal" | "warning" | "critical";
    connectivity: "normal" | "warning" | "critical";
    gps: "normal" | "warning" | "critical";
    catalyticConverter: "normal" | "warning" | "critical";
  };
}

interface SystemMetrics {
  cabinetTemp: number | null;
  upsCharge: number | null;
  flowPressure: number | null;
  cpuCapacity: number | null;
  serverStorage: number | null;
  gasCylinder1: number | null;
  gasCylinder2: number | null;
  systemStatus: "ok" | "warning" | "error";
  setSystemStatus: (status: "ok" | "warning" | "error") => void;
}

interface SensorData {
  TVOC: number | null;
  EtO: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  cabinetTemp: number | null;
  cavityPressure: number | null;
}

interface MeasurementState {
  state: "Idle" | "Running" | "SystemStartup" | "Unknown";
  systemStatus: "Executing" | "Idle" | "Unknown";
  currentJob: {
    jobId: number;
    recipe: string;
    elapsedTime: number;
    duration: number;
    status: "running" | "failed" | "cancelled" | "finished";
    jobType: "manual" | "scheduled";
  } | null;
  lastFetched: string;
}

interface DataContextType {
  systemInfo: SystemInfo;
  systemMetrics: SystemMetrics;
  sensorData: SensorData;
  measurementState: MeasurementState;
  updateSystemName: (name: string) => void;
  updateUpsPercentage: (percentage: number) => void;
  updateSystemData: (newData: Partial<DataContextType>) => void;
}

const defaultContext: DataContextType = {
  systemInfo: {
    name: "Workplace Monitoring System",
    id: "4959205",
    serialNumber: "P8FLA4959205",
    manufactureDate: new Date("2024-01-01"),
    location: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    ups: {
      percentage: 0,
      status: "Armed"
    },
    status: {
      anemometer: "normal",
      hvac: "normal",
      analyzer: "normal",
      sampleHandler: "normal",
      cpu: "normal",
      connectivity: "normal",
      gps: "normal",
      catalyticConverter: "normal"
    }
  },
  systemMetrics: {
    cabinetTemp: null,
    upsCharge: null,
    flowPressure: null,
    cpuCapacity: null,
    serverStorage: null,
    gasCylinder1: null,
    gasCylinder2: null,
    systemStatus: "ok",
    setSystemStatus: () => {}
  },
  sensorData: {
    TVOC: null,
    EtO: null,
    windSpeed: null,
    windDirection: null,
    cabinetTemp: null,
    cavityPressure: null
  },
  measurementState: {
    state: "Idle",
    systemStatus: "Idle",
    currentJob: null,
    lastFetched: new Date().toISOString()
  },
  updateSystemName: () => {},
  updateUpsPercentage: () => {},
  updateSystemData: () => {}
};

const DataContext = createContext<DataContextType>(defaultContext);

export function DataProvider({ children }: { children: React.ReactNode }) {
  return (
    <DataContext.Provider value={defaultContext}>
      {children}
    </DataContext.Provider>
  );
}

export function useSystemInfo() {
  const context = useContext(DataContext);
  if (!context)
    throw new Error("useSystemInfo must be used within DataProvider");
  return {
    ...context.systemInfo,
    updateSystemName: context.updateSystemName,
    updateUpsPercentage: context.updateUpsPercentage,
    updateSystemData: context.updateSystemData
  };
}

export function useSystemMetrics() {
  const context = useContext(DataContext);
  if (!context)
    throw new Error("useSystemMetrics must be used within DataProvider");
  return context.systemMetrics;
}

export function useSensorData() {
  const context = useContext(DataContext);
  if (!context)
    throw new Error("useSensorData must be used within DataProvider");
  return context.sensorData;
}

export function useMeasurementState() {
  const context = useContext(DataContext);
  if (!context)
    throw new Error("useMeasurementState must be used within DataProvider");
  return context.measurementState;
}
