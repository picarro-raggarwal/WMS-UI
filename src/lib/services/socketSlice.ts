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
} from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SocketState {
  subcomponentData: SubcomponentData[];
  driverAlerts: DriverAlert[];
  fencelineJobState: FencelineJobState | null;
  connected: boolean;
  // Namespace-specific streaming data
  anemometerData: AnemometerData | null;
  temperatureControllerData: TemperatureControllerData | null;
  catalyticConverterData: CatalyticConverterData | null;
  mfcData: MfcData | null;
  hvacSystemData: HvacSystemData | null;
  gasTankData: GasTankData | null;
  processedAlerts: AlertProcessedEvent[];
}

const initialState: SocketState = {
  subcomponentData: [],
  driverAlerts: [],
  fencelineJobState: null,
  connected: false,
  anemometerData: null,
  temperatureControllerData: null,
  catalyticConverterData: null,
  mfcData: null,
  hvacSystemData: null,
  gasTankData: null,
  processedAlerts: []
};

// Max number of items to keep in arrays
const MAX_ITEMS = 100;

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    socketConnected: (state) => {
      state.connected = true;
    },
    socketDisconnected: (state) => {
      state.connected = false;
    },
    socketSubcomponentDataReceived: (
      state,
      action: PayloadAction<SubcomponentData>
    ) => {
      state.subcomponentData = [
        action.payload,
        ...state.subcomponentData.slice(0, MAX_ITEMS - 1)
      ];
    },
    socketDriverAlertsReceived: (state, action: PayloadAction<DriverAlert>) => {
      state.driverAlerts = [
        action.payload,
        ...state.driverAlerts.slice(0, MAX_ITEMS - 1)
      ];
    },
    socketFencelineJobStateReceived: (
      state,
      action: PayloadAction<FencelineJobState>
    ) => {
      state.fencelineJobState = action.payload;
    },
    socketProcessedAlertsReceived: (
      state,
      action: PayloadAction<AlertProcessedEvent>
    ) => {
      state.processedAlerts = [
        action.payload,
        ...state.processedAlerts.slice(0, MAX_ITEMS - 1)
      ];
    },
    // Namespace-specific data update actions
    socketAnemometerDataReceived: (
      state,
      action: PayloadAction<AnemometerData>
    ) => {
      state.anemometerData = action.payload;
    },
    socketTemperatureControllerDataReceived: (
      state,
      action: PayloadAction<TemperatureControllerData>
    ) => {
      state.temperatureControllerData = action.payload;
    },
    socketCatalyticConverterDataReceived: (
      state,
      action: PayloadAction<CatalyticConverterData>
    ) => {
      state.catalyticConverterData = action.payload;
    },
    socketMfcDataReceived: (state, action: PayloadAction<MfcData>) => {
      state.mfcData = action.payload;
    },
    socketHvacSystemDataReceived: (
      state,
      action: PayloadAction<HvacSystemData>
    ) => {
      state.hvacSystemData = action.payload;
    },
    socketGasTankDataReceived: (state, action: PayloadAction<GasTankData>) => {
      state.gasTankData = action.payload;
    },
    clearSubcomponentData: (state) => {
      state.subcomponentData = [];
    },
    clearDriverAlerts: (state) => {
      state.driverAlerts = [];
    },
    clearProcessedAlerts: (state) => {
      state.processedAlerts = [];
    }
  }
});

export const {
  socketConnected,
  socketDisconnected,
  socketSubcomponentDataReceived,
  socketDriverAlertsReceived,
  socketFencelineJobStateReceived,
  socketProcessedAlertsReceived,
  socketAnemometerDataReceived,
  socketTemperatureControllerDataReceived,
  socketCatalyticConverterDataReceived,
  socketMfcDataReceived,
  socketHvacSystemDataReceived,
  socketGasTankDataReceived,
  clearSubcomponentData,
  clearDriverAlerts,
  clearProcessedAlerts
} = socketSlice.actions;

export default socketSlice.reducer;
