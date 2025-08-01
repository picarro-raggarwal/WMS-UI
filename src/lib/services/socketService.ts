import {
  AlertProcessedEvent,
  AnemometerData,
  CatalyticConverterData,
  DriverAlert,
  FencelineJobState,
  GasTankData,
  HvacSystemData,
  MfcData,
  SubcomponentData,
  TemperatureControllerData
} from "@/types/socket";
import { io, Socket } from "socket.io-client";
import {
  socketAnemometerDataReceived,
  socketCatalyticConverterDataReceived,
  socketConnected,
  socketDisconnected,
  socketDriverAlertsReceived,
  socketFencelineJobStateReceived,
  socketGasTankDataReceived,
  socketHvacSystemDataReceived,
  socketMfcDataReceived,
  socketProcessedAlertsReceived,
  socketSubcomponentDataReceived,
  socketTemperatureControllerDataReceived
} from "../services/socketSlice";
import { store } from "../store";

// All namespaces now listen to ALL events via onAny()
const ALL_NAMESPACES = [
  "fenceline_job_state_machine",
  "anemometer_data",
  "catalytic_converter_data",
  "gas_tank_data",
  "hvac_system_data",
  "temperature_controller_data",
  "mfc_data",
  "samlet_data",
  "analyzer_live_data",
  "processed_alerts"
];

class SocketService {
  private sockets: Record<string, Socket | null> = {};
  private readonly serverUrl = window.location.origin;
  private path = "/socket.io";

  // Namespace mappings
  private namespaces = {
    fenceline_job_state_machine: "/fenceline_job_state_machine",
    anemometer_data: "/anemometer_data",
    catalytic_converter_data: "/catalytic_converter_data",
    gas_tank_data: "/gas_tank_data",
    hvac_system_data: "/hvac_system_data",
    temperature_controller_data: "/temperature_controller_data",
    mfc_data: "/mfc_data",
    samlet_data: "/samlet_data",
    analyzer_live_data: "/analyzer_live_data",
    processed_alerts: "/processed_alerts"
  };

  connect() {
    if (Object.keys(this.sockets).length > 0) return;

    // console.log("Connecting to all namespaces and listening for ALL events in each...");

    // Connect to all namespaces
    ALL_NAMESPACES.forEach((namespace) => {
      const namespacePath =
        this.namespaces[namespace as keyof typeof this.namespaces];
      // console.log(`Connecting to ${this.serverUrl}${namespacePath}`);

      this.sockets[namespace] = io(`${this.serverUrl}${namespacePath}`, {
        transports: ["websocket"],
        path: this.path,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
    });

    this.setupEventListeners();
    // console.log("All socket connections initialized");
  }

  // Method to set namespace (keeping for compatibility)
  setNamespace(namespace: string) {
    // console.log(`Setting namespace to: ${namespace}`);
    if (Object.keys(this.sockets).length > 0) {
      this.disconnect();
      this.connect();
    }
  }

  disconnect() {
    // console.log("Disconnecting all sockets...");

    Object.entries(this.sockets).forEach(([namespace, socket]) => {
      if (socket) {
        // console.log(`Disconnecting ${namespace} socket...`);
        socket.offAny(); // Remove all listeners
        socket.disconnect();
      }
    });

    this.sockets = {};
    store.dispatch(socketDisconnected());
    // console.log("All sockets disconnected");
  }

  private setupEventListeners() {
    if (Object.keys(this.sockets).length === 0) return;

    // Set up listeners for all namespaces
    Object.entries(this.sockets).forEach(([namespace, socket]) => {
      if (!socket) return;

      const namespacePath =
        this.namespaces[namespace as keyof typeof this.namespaces];

      // Connection/disconnection events
      socket.on("connect", () => {
        // console.log(`${namespace} socket connected to: ${this.serverUrl}${namespacePath}`);
        if (namespace === "fenceline_job_state_machine") {
          store.dispatch(socketConnected());
        }
      });

      socket.on("disconnect", (reason) => {
        // console.log(`${namespace} socket disconnected: ${reason}`);
        if (namespace === "fenceline_job_state_machine") {
          store.dispatch(socketDisconnected());
        }
      });

      socket.on("connect_error", (error) => {
        console.error(`${namespace} socket connection error:`, error);
        if (namespace === "fenceline_job_state_machine") {
          store.dispatch(socketDisconnected());
        }
      });

      // Listen to ALL events in each namespace
      socket.onAny((eventName: string, data: unknown) => {
        // console.log(`🔄 Received event '${eventName}' from ${namespace} namespace:`, data);

        // Handle specific known events for Redux store updates
        if (
          eventName === "fenceline_job_state" ||
          eventName === "current_state"
        ) {
          store.dispatch(
            socketFencelineJobStateReceived(data as FencelineJobState)
          );
        } else if (eventName === "subcomponent_data") {
          store.dispatch(
            socketSubcomponentDataReceived(data as SubcomponentData)
          );
        } else if (eventName === "DriverAlerts") {
          store.dispatch(socketDriverAlertsReceived(data as DriverAlert));
        } else if (eventName === "alert_processed") {
          store.dispatch(
            socketProcessedAlertsReceived(data as AlertProcessedEvent)
          );
        } else if (eventName === "data_update") {
          // Handle namespace-specific data_update events
          const updateData = data as { object?: string };
          switch (updateData?.object) {
            case "anemometer_data":
              store.dispatch(
                socketAnemometerDataReceived(updateData as AnemometerData)
              );
              break;
            case "temperature_controller_data":
              store.dispatch(
                socketTemperatureControllerDataReceived(
                  updateData as TemperatureControllerData
                )
              );
              break;
            case "catalytic_converter_data":
              store.dispatch(
                socketCatalyticConverterDataReceived(
                  updateData as CatalyticConverterData
                )
              );
              break;
            case "mfc_data":
              store.dispatch(socketMfcDataReceived(updateData as MfcData));
              break;
            case "hvac_system_data":
              store.dispatch(
                socketHvacSystemDataReceived(updateData as HvacSystemData)
              );
              break;
            case "gas_tank_data":
              store.dispatch(
                socketGasTankDataReceived(updateData as GasTankData)
              );
              break;
            default:
              console.log(
                `Unhandled data_update object type: ${updateData?.object}`
              );
          }
        }
      });
    });
  }

  // Add a method to handle raw event listeners
  onRawEvent(topic: string, callback: (data: unknown) => void) {
    // Find the appropriate socket - since we're listening to all events,
    // we can just attach to any socket for now (or all sockets)
    const fencelineSocket = this.sockets["fenceline_job_state_machine"];
    if (fencelineSocket) {
      fencelineSocket.on(topic, callback);
      return () => {
        fencelineSocket.off(topic, callback);
      };
    }
  }

  // Add methods to listen to all events from specific namespaces
  onNamespaceAnyEvent(
    namespace: string,
    callback: (eventName: string, data: unknown) => void
  ) {
    const socket = this.sockets[namespace];
    if (!socket) return;

    socket.onAny(callback);
    return () => {
      socket?.offAny(callback);
    };
  }

  // Compatibility method - listen to all events from fenceline namespace
  onRunningStatusAnyEvent(
    callback: (eventName: string, data: unknown) => void
  ) {
    return this.onNamespaceAnyEvent("fenceline_job_state_machine", callback);
  }
}

export const socketService = new SocketService();
