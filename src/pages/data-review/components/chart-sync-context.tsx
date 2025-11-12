import type { ECharts } from "echarts";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState
} from "react";

interface ChartSyncContextType {
  isSyncEnabled: boolean;
  setIsSyncEnabled: (enabled: boolean) => void;
  registerChart: (portId: string, instance: ECharts | null) => void;
  unregisterChart: (portId: string) => void;
  syncZoom: (sourcePortId: string, start: number, end: number) => void;
  resetAllCharts: () => void;
}

const ChartSyncContext = createContext<ChartSyncContextType | undefined>(
  undefined
);

interface ChartSyncProviderProps {
  children: ReactNode;
}

export const ChartSyncProvider = ({ children }: ChartSyncProviderProps) => {
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);
  const chartInstancesRef = useRef<Map<string, ECharts>>(new Map());
  const isSyncingRef = useRef(false);

  const registerChart = useCallback(
    (portId: string, instance: ECharts | null) => {
      if (instance) {
        chartInstancesRef.current.set(portId, instance);
      } else {
        chartInstancesRef.current.delete(portId);
      }
    },
    []
  );

  const unregisterChart = useCallback((portId: string) => {
    chartInstancesRef.current.delete(portId);
  }, []);

  const syncZoom = useCallback(
    (sourcePortId: string, start: number, end: number) => {
      if (!isSyncEnabled || isSyncingRef.current) return;

      isSyncingRef.current = true;
      chartInstancesRef.current.forEach((instance, portId) => {
        if (portId !== sourcePortId) {
          instance.dispatchAction({
            type: "dataZoom",
            start,
            end
          });
        }
      });
      // Reset flag after a short delay to allow events to process
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 50);
    },
    [isSyncEnabled]
  );

  const resetAllCharts = useCallback(() => {
    if (!isSyncEnabled) return;

    isSyncingRef.current = true;
    chartInstancesRef.current.forEach((instance) => {
      instance.dispatchAction({
        type: "dataZoom",
        start: 0,
        end: 100
      });
    });
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 50);
  }, [isSyncEnabled]);

  return (
    <ChartSyncContext.Provider
      value={{
        isSyncEnabled,
        setIsSyncEnabled,
        registerChart,
        unregisterChart,
        syncZoom,
        resetAllCharts
      }}
    >
      {children}
    </ChartSyncContext.Provider>
  );
};

export const useChartSync = () => {
  const context = useContext(ChartSyncContext);
  if (context === undefined) {
    throw new Error("useChartSync must be used within a ChartSyncProvider");
  }
  return context;
};
