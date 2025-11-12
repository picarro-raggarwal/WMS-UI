import { loadPortConfig } from "@/types/common/port-config";
import {
  generateAllPorts,
  getAmbientPort,
  getPortDisplayName,
  isAmbientPort
} from "@/types/common/ports";

export interface PortData {
  id: string;
  label: string;
  number: number;
  unit: string;
  type: string;
}

export interface MockChartDataPoint {
  timestamp: number;
  value: number;
}

export interface MockChartData {
  portId: string;
  data: MockChartDataPoint[];
  stats: {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
  };
}

// Generate ports using common port configuration
// Only includes enabled ports and Ambient port
export const generatePorts = (): PortData[] => {
  const portConfig = loadPortConfig();
  const commonPorts = generateAllPorts();

  // Filter to only enabled ports
  const enabledPorts = commonPorts.filter(
    (port) => portConfig.enabled[port.portNumber] !== false
  );

  // Add Ambient port (always enabled)
  const ambientPort = getAmbientPort();

  // Combine Ambient port with enabled regular ports
  const allPorts = [ambientPort, ...enabledPorts];

  return allPorts.map((port) => ({
    id: port.id,
    label: getPortDisplayName(port),
    number: port.portNumber,
    unit: "ppb",
    type: isAmbientPort(port.portNumber) ? "ambient" : "generic"
  }));
};

// Generate realistic mock data for a specific port
export const generateMockDataForPort = (
  port: PortData,
  startTime: number,
  endTime: number,
  intervalMs: number = 60000 // 1 minute intervals
): MockChartData => {
  const dataPoints: MockChartDataPoint[] = [];
  const duration = endTime - startTime;
  const numPoints = Math.floor(duration / intervalMs);

  // Generic configuration for all ports
  const config = {
    base: 100 + port.number * 5, // Base value varies by port number
    range: 20 + port.number * 0.5, // Range varies by port number
    trend: 0.1 + port.number * 0.01 // Trend varies by port number
  };

  let currentValue = config.base;
  const values: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const timestamp = startTime + i * intervalMs;

    // Add some realistic variation with trend
    const randomVariation = (Math.random() - 0.5) * config.range;
    const trendComponent =
      Math.sin((i / numPoints) * Math.PI * 2) * config.trend;
    const noise = (Math.random() - 0.5) * config.range * 0.1;

    currentValue = config.base + randomVariation + trendComponent + noise;

    // Ensure values stay within reasonable bounds for generic ports
    const minBound = Math.max(0, config.base - config.range * 2);
    const maxBound = config.base + config.range * 2;
    currentValue = Math.max(minBound, Math.min(maxBound, currentValue));

    dataPoints.push({
      timestamp,
      value: Math.round(currentValue * 100) / 100
    });

    values.push(currentValue);
  }

  // Calculate statistics
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    portId: port.id,
    data: dataPoints,
    stats: {
      mean: Math.round(mean * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100
    }
  };
};

// Generate mock data for multiple ports
export const generateMockDataForPorts = (
  ports: PortData[],
  startTime: number,
  endTime: number,
  intervalMs: number = 60000
): MockChartData[] => {
  return ports.map((port) =>
    generateMockDataForPort(port, startTime, endTime, intervalMs)
  );
};

// Default ports for easy access
export const mockPorts = generatePorts();

// Helper function to get port by ID
export const getPortById = (portId: string): PortData | undefined => {
  return mockPorts.find((port) => port.id === portId);
};

// Helper function to get ports by type
export const getPortsByType = (type: string): PortData[] => {
  return mockPorts.filter((port) => port.type === type);
};
