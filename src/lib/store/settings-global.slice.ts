import {
  InletsResponse as ApiInletsResponse,
  Inlet,
  PortConfigurationResponse
} from "@/pages/settings/data/port-configuration.slice";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Get label from inlet object with fallback priority:
 * 1. inlet.label (if not empty/null)
 * 2. inlet.name (if not empty/null)
 * 3. Port #{id} (using inlet id)
 */
export const getInletLabel = (inlet: {
  bankId: number;
  id: number;
  label?: string;
  name?: string;
}): string => {
  // Priority: label -> name -> Port #id
  if (inlet.label && inlet.label.trim()) {
    return inlet.label.trim();
  }
  if (inlet.name && inlet.name.trim()) {
    return inlet.name.trim();
  }
  return `Port #${inlet.id}`;
};

export interface InletWithPortId extends Inlet {
  portId: number;
  displayLabel: string;
  isEnabled: boolean;
}

export interface InletsResponse {
  result: InletWithPortId[];
}

interface SettingsGlobalState {
  inlets: InletsResponse | null;
  portConfiguration: PortConfigurationResponse | null;
  lastUpdated: {
    inlets: number | null;
    portConfiguration: number | null;
  };
}

const initialState: SettingsGlobalState = {
  inlets: null,
  portConfiguration: null,
  lastUpdated: {
    inlets: null,
    portConfiguration: null
  }
};

/**
 * Calculate port number from bankId and inlet id
 * Formula: (bankId - 1) * 8 + id
 */
const calculatePortId = (bankId: number, id: number): number => {
  return (bankId - 1) * 8 + id;
};

export const settingsGlobalSlice = createSlice({
  name: "settingsGlobal",
  initialState,
  reducers: {
    setInlets: (state, action: PayloadAction<ApiInletsResponse>) => {
      // Get enabled ports from port configuration if available
      const enabledPortsSet = state.portConfiguration?.result?.enabled_ports
        ? new Set(state.portConfiguration.result.enabled_ports)
        : new Set<number>();

      // Transform inlets to include portId, displayLabel, and isEnabled
      const inletsWithPortId: InletWithPortId[] = action.payload.result.map(
        (inlet): InletWithPortId => {
          const portId = calculatePortId(inlet.bankId, inlet.id);
          return {
            ...inlet,
            portId,
            displayLabel: getInletLabel(inlet),
            isEnabled: enabledPortsSet.has(portId)
          };
        }
      );

      state.inlets = {
        result: inletsWithPortId
      };
      state.lastUpdated.inlets = Date.now();
    },
    setPortConfiguration: (
      state,
      action: PayloadAction<PortConfigurationResponse>
    ) => {
      state.portConfiguration = action.payload;
      state.lastUpdated.portConfiguration = Date.now();

      // Update isEnabled for all inlets based on new port configuration
      if (state.inlets?.result) {
        const enabledPortsSet = action.payload.result?.enabled_ports
          ? new Set(action.payload.result.enabled_ports)
          : new Set<number>();

        state.inlets.result = state.inlets.result.map((inlet) => ({
          ...inlet,
          isEnabled: enabledPortsSet.has(inlet.portId)
        }));
      }
    },
    clearSettingsGlobal: (state) => {
      state.inlets = null;
      state.portConfiguration = null;
      state.lastUpdated.inlets = null;
      state.lastUpdated.portConfiguration = null;
    }
  }
});

export const { setInlets, setPortConfiguration, clearSettingsGlobal } =
  settingsGlobalSlice.actions;

export default settingsGlobalSlice.reducer;
