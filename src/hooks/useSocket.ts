import { useEffect } from "react";
import { socketService } from "@/lib/services/socketService";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

interface UseSocketOptions {
  namespace?: string;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { namespace } = options;
  const {
    subcomponentData,
    driverAlerts,
    fencelineJobState,
    connected,
    anemometerData,
    temperatureControllerData,
    catalyticConverterData,
    mfcData,
    hvacSystemData,
    gasTankData,
    processedAlerts,
  } = useSelector((state: RootState) => state.socket);

  useEffect(() => {
    // Set namespace if provided
    if (namespace) {
      socketService.setNamespace(namespace);
    }

    // Initialize socket connection when component mounts
    socketService.connect();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [namespace]);

  return {
    subcomponentData,
    driverAlerts,
    fencelineJobState,
    connected,
    // Namespace-specific streaming data
    anemometerData,
    temperatureControllerData,
    catalyticConverterData,
    mfcData,
    hvacSystemData,
    gasTankData,
    processedAlerts,
    setNamespace: socketService.setNamespace.bind(socketService),
  };
};
