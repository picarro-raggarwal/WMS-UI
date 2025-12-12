import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  loadPortConfig,
  savePortConfig,
  updatePortEnabledStatuses,
  updatePortNames,
  type PortConfig
} from "@/types/common/port-config";
import {
  AMBIENT_PORT_NUMBER,
  generateAllPorts,
  getAmbientPort,
  isAmbientPort,
  mockStepNames
} from "@/types/common/ports";
import { Check, Edit3, RotateCcw, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { mockPortLabelsData } from "../data/port-configuration-mock-data";
import {
  useGetInletsQuery,
  useGetPortConfigurationQuery,
  useGetPortLabelsQuery,
  useUpdatePortConfigurationMutation,
  useUpdatePortLabelMutation
} from "../data/port-configuration.slice";

interface Port {
  id: string;
  portNumber: number;
  name: string;
  bankNumber: number;
  enabled: boolean;
  type: "regular" | "ambient";
}

export const PortConfigurationTab = () => {
  // Fetch port configuration from API
  const { data: apiPortConfig, isLoading: isApiLoading } =
    useGetPortConfigurationQuery();

  // Fetch port labels from API
  const { data: apiPortLabels, isError: isPortLabelsError } =
    useGetPortLabelsQuery();

  // Fetch inlets from API
  const {
    data: apiInlets,
    isLoading: isInletsLoading,
    isError: isInletsError
  } = useGetInletsQuery();

  // Mutation for updating port label
  const [updatePortLabel] = useUpdatePortLabelMutation();

  // Mutation for updating port configuration (enabled ports)
  const [updatePortConfiguration] = useUpdatePortConfigurationMutation();

  // State for validation errors
  const [portLabelsError, setPortLabelsError] = useState<string | null>(null);
  const [inletsError, setInletsError] = useState<string | null>(null);

  // Validate port labels API response
  useEffect(() => {
    if (isPortLabelsError) {
      const errorMsg = "Failed to fetch port labels from API";
      console.error("Port Labels API Error:", errorMsg);
      setPortLabelsError(errorMsg);
      return;
    }

    if (!apiPortLabels) return;

    if (!apiPortLabels.result) {
      const errorMsg = "Port labels API returned null or undefined data";
      console.error("Port Labels API Error:", errorMsg, apiPortLabels);
      setPortLabelsError(errorMsg);
    } else if (
      Array.isArray(apiPortLabels.result) &&
      apiPortLabels.result.length === 0
    ) {
      const errorMsg = "Port labels API returned empty array";
      console.error("Port Labels API Error:", errorMsg, apiPortLabels);
      setPortLabelsError(errorMsg);
    } else {
      setPortLabelsError(null);
    }
  }, [apiPortLabels, isPortLabelsError]);

  // Validate inlets API response
  useEffect(() => {
    if (isInletsError) {
      const errorMsg = "Failed to fetch inlets from API";
      console.error("Inlets API Error:", errorMsg);
      setInletsError(errorMsg);
      return;
    }

    if (!apiInlets) return;

    if (!apiInlets.result) {
      const errorMsg = "Inlets API returned null or undefined data";
      console.error("Inlets API Error:", errorMsg, apiInlets);
      setInletsError(errorMsg);
    } else if (
      Array.isArray(apiInlets.result) &&
      apiInlets.result.length === 0
    ) {
      const errorMsg = "Inlets API returned empty array";
      console.error("Inlets API Error:", errorMsg, apiInlets);
      setInletsError(errorMsg);
    } else {
      setInletsError(null);
    }
  }, [apiInlets, isInletsError]);

  // Use mock data if API fails, otherwise use API data
  const portLabelsData = useMemo(() => {
    if (isPortLabelsError || !apiPortLabels || portLabelsError) {
      return mockPortLabelsData;
    }
    return apiPortLabels;
  }, [apiPortLabels, isPortLabelsError, portLabelsError]);

  // Create port labels map from API/mock data
  const portLabelsMap = useMemo(() => {
    const labelsMap: Record<number, string> = {};
    if (portLabelsData?.result) {
      portLabelsData.result.forEach((label) => {
        const portNumber = parseInt(label.portId, 10);
        if (!isNaN(portNumber)) {
          labelsMap[portNumber] = label.portLabel;
        }
      });
    }
    return labelsMap;
  }, [portLabelsData]);

  // Check if both APIs have returned data
  const isDataReady = useMemo(() => {
    return !!(apiInlets?.result && apiPortConfig?.result);
  }, [apiInlets, apiPortConfig]);

  // Initial state from API - this is the baseline for comparison
  const [initialApiState, setInitialApiState] = useState<PortConfig | null>(
    null
  );

  // Current port configuration state
  const [portConfig, setPortConfig] = useState<PortConfig>(() =>
    loadPortConfig()
  );

  // Update port config when both APIs return data
  useEffect(() => {
    // Only proceed if both APIs have data
    if (!apiInlets?.result || !apiPortConfig?.result) return;

    // Create Set of enabled port numbers from port configuration API
    const enabledPortsSet = apiPortConfig.result.enabled_ports
      ? new Set(apiPortConfig.result.enabled_ports)
      : new Set<number>();

    const apiConfig: PortConfig = {
      names: {},
      enabled: {}
    };

    // Process inlets data - only PORT type
    apiInlets.result.forEach((inlet) => {
      // Only process PORT type inlets
      if (inlet.type !== "PORT") return;

      if (!inlet.available) return;

      // Calculate port number: (bankId - 1) * 8 + id
      const portNumber = (inlet.bankId - 1) * 8 + inlet.id;

      // Set enabled status from port configuration API
      // Check if calculated port number exists in enabled_ports array
      apiConfig.enabled[portNumber] = enabledPortsSet.has(portNumber);

      // Set port names from inlet label or name
      apiConfig.names[portNumber] =
        inlet.label || inlet.name || `Port ${portNumber}`;
    });

    // Ensure Ambient port is always enabled
    apiConfig.enabled[0] = true;
    apiConfig.names[0] = "Ambient";

    // Set initial API state (baseline for comparison)
    setInitialApiState(apiConfig);

    // Set current port config to API state
    setPortConfig(apiConfig);
  }, [apiInlets, apiPortConfig]);

  // Store the original port names from API/mock data for reset functionality
  const originalMockNames = useMemo<Record<number, string>>(() => {
    const initialNames: Record<number, string> = {};
    // Use port labels from API if available, otherwise fallback to mockStepNames
    if (Object.keys(portLabelsMap).length > 0) {
      Object.entries(portLabelsMap).forEach(([portNum, label]) => {
        const portNumber = parseInt(portNum, 10);
        if (!isNaN(portNumber)) {
          initialNames[portNumber] = label;
        }
      });
    } else {
      // Fallback to mockStepNames if port labels not loaded yet
      for (let i = 1; i <= 64; i++) {
        initialNames[i] = mockStepNames[i] || `Port ${i}`;
      }
    }
    return initialNames;
  }, [portLabelsMap]);

  // Use portConfig state instead of separate portNames/portEnabled
  const portNames = portConfig.names;
  const portEnabled = portConfig.enabled;

  // Update port config when needed
  const setPortNames = (
    names:
      | Record<number, string>
      | ((prev: Record<number, string>) => Record<number, string>)
  ) => {
    const newNames =
      typeof names === "function" ? names(portConfig.names) : names;
    const newConfig = { ...portConfig, names: newNames };
    setPortConfig(newConfig);
  };

  const setPortEnabled = (
    enabled:
      | Record<number, boolean>
      | ((prev: Record<number, boolean>) => Record<number, boolean>)
  ) => {
    const newEnabled =
      typeof enabled === "function" ? enabled(portConfig.enabled) : enabled;
    const newConfig = { ...portConfig, enabled: newEnabled };
    setPortConfig(newConfig);
  };

  const [editingPort, setEditingPort] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [showEstablishFlowRateDialog, setShowEstablishFlowRateDialog] =
    useState(false);
  const [showSaveConfirmationDialog, setShowSaveConfirmationDialog] =
    useState(false);

  // Helper function to extract error message from API error
  const extractErrorMessage = (error: any): string | null => {
    if (
      error?.data?.message &&
      typeof error.data.message === "string" &&
      error.data.message.trim()
    ) {
      return error.data.message.trim();
    }
    if (
      error?.data?.error &&
      typeof error.data.error === "string" &&
      error.data.error.trim()
    ) {
      return error.data.error.trim();
    }
    if (
      error?.message &&
      typeof error.message === "string" &&
      error.message.trim()
    ) {
      return error.message.trim();
    }
    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }
    return null;
  };

  // Check if there are unsaved changes compared to initial API state
  const hasUnsavedChanges = useMemo(() => {
    if (!initialApiState) return false;

    // Check port names changes
    const allPortNumbers = new Set([
      ...Object.keys(portNames).map(Number),
      ...Object.keys(initialApiState.names).map(Number)
    ]);

    for (const portNumber of allPortNumbers) {
      if (portNames[portNumber] !== initialApiState.names[portNumber]) {
        return true;
      }
    }

    // Check port enabled status changes
    const allEnabledPortNumbers = new Set([
      ...Object.keys(portEnabled).map(Number),
      ...Object.keys(initialApiState.enabled).map(Number)
    ]);

    for (const portNumber of allEnabledPortNumbers) {
      if (portEnabled[portNumber] !== initialApiState.enabled[portNumber]) {
        return true;
      }
    }

    return false;
  }, [portNames, portEnabled, initialApiState]);

  const handleSaveAllChanges = async () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      // Update port labels via API for all changed port names
      if (initialApiState) {
        const portLabelUpdates: Promise<void>[] = [];

        // Find all changed port names
        Object.entries(portNames).forEach(([portNum, currentName]) => {
          const portNumber = parseInt(portNum, 10);
          const originalName = initialApiState.names[portNumber];

          // If name has changed and we have inlet info, add to update queue
          if (
            currentName &&
            currentName !== originalName &&
            portToInletMap[portNumber]
          ) {
            const inletInfo = portToInletMap[portNumber];
            portLabelUpdates.push(
              updatePortLabel({
                bankId: inletInfo.bankId,
                inletId: inletInfo.inletId,
                label: currentName
              })
                .unwrap()
                .then(() => {
                  /* empty */
                })
                .catch((error: any) => {
                  console.error(
                    `Failed to update port label for port ${portNumber}:`,
                    error
                  );
                  const errorMessage =
                    extractErrorMessage(error) ||
                    `Failed to update port ${portNumber}`;
                  throw new Error(errorMessage);
                })
            );
          }
        });

        // Execute all port label updates
        if (portLabelUpdates.length > 0) {
          await Promise.all(portLabelUpdates);
        }
      }

      // Update port configuration (enabled ports) if status has changed
      if (initialApiState) {
        const hasPortStatusChanges = Object.entries(portEnabled).some(
          ([portNum, enabled]) => {
            const portNumber = parseInt(portNum, 10);
            return enabled !== initialApiState.enabled[portNumber];
          }
        );

        if (hasPortStatusChanges) {
          const enabledPortsArray = Object.entries(portEnabled)
            .filter(([_, enabled]) => enabled === true)
            .map(([portNum]) => parseInt(portNum, 10))
            .sort((a, b) => a - b);

          await updatePortConfiguration({
            enabled_ports: enabledPortsArray
          }).unwrap();
        }
      }

      // Save to shared storage
      savePortConfig(portConfig);

      // Notify other components
      updatePortNames(portConfig.names);
      updatePortEnabledStatuses(portConfig.enabled);

      // Success toast
      toast.success("Port configuration saved successfully!");

      // Update the initial API state to current values (new baseline)
      setInitialApiState({ ...portConfig });
    } catch (error: any) {
      console.error("Error saving port configuration:", error);
      const errorMessage = extractErrorMessage(error);
      toast.info(
        errorMessage || "Failed to save port configuration. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEstablishFlowRate = async () => {
    try {
      // TODO: Implement actual establish flow rate API call
      // Example: await establishFlowRate()

      // Simulate network call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Flow rate established successfully!");
    } catch (error) {
      toast.info("Failed to establish flow rate. Please try again.");
    }
  };

  const handleSaveWithConfirmation = () => {
    if (!initialApiState) {
      handleSaveAllChanges();
      return;
    }

    const hasPortStatusChanges = Object.entries(portEnabled).some(
      ([portNum, enabled]) => {
        const portNumber = parseInt(portNum, 10);
        return enabled !== initialApiState.enabled[portNumber];
      }
    );

    if (hasPortStatusChanges) {
      setShowSaveConfirmationDialog(true);
    } else {
      handleSaveAllChanges();
    }
  };

  // Create Set of enabled port numbers from port configuration API
  const enabledPortsSet = useMemo(() => {
    if (apiPortConfig?.result?.enabled_ports) {
      return new Set(apiPortConfig.result.enabled_ports);
    }
    return new Set<number>();
  }, [apiPortConfig]);

  // Create a map from portNumber to {bankId, inletId} for API calls
  const portToInletMap = useMemo(() => {
    const map: Record<number, { bankId: number; inletId: number }> = {};

    if (apiInlets?.result) {
      apiInlets.result.forEach((inlet) => {
        // Only process PORT type inlets
        if (inlet.type !== "PORT") return;

        // Skip if not available
        if (!inlet.available) return;

        // Calculate port number: (bankId - 1) * 8 + id
        const portNumber = (inlet.bankId - 1) * 8 + inlet.id;

        map[portNumber] = {
          bankId: inlet.bankId,
          inletId: inlet.id
        };
      });
    }

    return map;
  }, [apiInlets]);

  // Transform inlets data to Port format and group by bankId
  const portsByBank = useMemo(() => {
    const byBank: Record<number, Port[]> = {};

    // Initialize bank 0 for Ambient port
    byBank[0] = [
      {
        ...getAmbientPort(),
        name: portNames[AMBIENT_PORT_NUMBER] || getAmbientPort().name
      }
    ];

    // Process inlets if available
    if (apiInlets?.result) {
      apiInlets.result.forEach((inlet) => {
        // Only display PORT type inlets
        if (inlet.type !== "PORT") return;

        // Skip if not available
        if (!inlet.available) return;

        // Calculate port number: (bankId - 1) * 8 + id
        const portNumber = (inlet.bankId - 1) * 8 + inlet.id;

        // Get display name (use label if available, otherwise name)
        let displayName: string;
        if (editingPort === portNumber) {
          displayName = editValue;
        } else {
          displayName =
            portNames[portNumber] ||
            inlet.label ||
            inlet.name ||
            `Port ${portNumber}`;
        }

        // Determine enabled status from port configuration API
        // Check if calculated port number exists in enabled_ports array
        const isEnabledFromApi = enabledPortsSet.has(portNumber);

        // Use portEnabled state if set, otherwise use enabled status from port configuration API
        const enabled =
          portEnabled[portNumber] !== undefined
            ? portEnabled[portNumber] === true
            : isEnabledFromApi;

        const port: Port = {
          id: `inlet-${inlet.id}`,
          portNumber,
          name: displayName,
          bankNumber: inlet.bankId,
          enabled,
          type: "regular"
        };

        // Group by bankId
        if (!byBank[inlet.bankId]) {
          byBank[inlet.bankId] = [];
        }
        byBank[inlet.bankId].push(port);
      });
    } else {
      // Fallback to original logic if inlets not available
      const basePorts = generateAllPorts();
      const availablePortNumbers = apiPortConfig?.result?.available_ports
        ? new Set(apiPortConfig.result.available_ports)
        : new Set(Array.from({ length: 64 }, (_, i) => i + 1));

      basePorts
        .filter((port) => availablePortNumbers.has(port.portNumber))
        .forEach((port) => {
          let displayName: string;
          if (editingPort === port.portNumber) {
            displayName = editValue;
          } else {
            displayName =
              portNames[port.portNumber] ||
              portLabelsMap[port.portNumber] ||
              port.name;
          }

          const portData: Port = {
            id: port.id,
            portNumber: port.portNumber,
            name: displayName,
            bankNumber: port.bankNumber,
            enabled: portEnabled[port.portNumber] === true,
            type: "regular" as const
          };

          if (!byBank[port.bankNumber]) {
            byBank[port.bankNumber] = [];
          }
          byBank[port.bankNumber].push(portData);
        });
    }

    // Sort ports within each bank by portNumber
    Object.keys(byBank).forEach((bankKey) => {
      const bankNum = parseInt(bankKey, 10);
      byBank[bankNum].sort((a, b) => a.portNumber - b.portNumber);
    });

    return byBank;
  }, [
    apiInlets,
    apiPortConfig,
    enabledPortsSet,
    editingPort,
    editValue,
    portNames,
    portLabelsMap,
    portEnabled
  ]);

  const handleEditStart = (portNumber: number, currentName: string) => {
    // Prevent editing Ambient port
    if (isAmbientPort(portNumber)) {
      return;
    }
    setEditingPort(portNumber);
    setEditValue(currentName);
    setOriginalValue(originalMockNames[portNumber]);
  };

  const handleEditSave = (portNumber: number) => {
    const trimmedValue = editValue.trim();

    if (!trimmedValue) return;

    if (trimmedValue.length > 20) {
      toast.info("Port label cannot exceed 20 characters");
      return;
    }

    // Update local state - API will be called when user clicks Save button
    setPortNames((prev) => ({
      ...prev,
      [portNumber]: trimmedValue
    }));

    setEditingPort(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingPort(null);
    setEditValue("");
  };

  const handleResetToOriginal = () => {
    if (originalValue) {
      setEditValue(originalValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, portNumber: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEditSave(portNumber);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleEditCancel();
    }
  };

  // Show loading state until both APIs (inlets and port configuration) return data
  if (isInletsLoading || isApiLoading || !isDataReady) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-neutral-500 dark:text-neutral-400">
          Loading port configuration...
        </div>
      </div>
    );
  }

  // Show "No data" message if APIs returned invalid data
  if (
    inletsError ||
    (apiInlets &&
      (!apiInlets.result ||
        (Array.isArray(apiInlets.result) && apiInlets.result.length === 0)))
  ) {
    return (
      <div className="flex flex-col justify-center items-center p-8 space-y-4">
        <div className="text-neutral-900 dark:text-neutral-100 text-lg font-semibold">
          No Data Available
        </div>
        <div className="text-neutral-600 dark:text-neutral-400 text-sm text-center max-w-md">
          {inletsError ||
            "Inlets API returned no data. Please check the console for more details."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="justify-between items-start gap-4 grid grid-cols-4">
            <div className="flex flex-col grid-flow-col col-span-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                Port Configuration
              </CardTitle>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-sm">
                Edit port labels and toggle port status.
              </p>
            </div>
            <div className="flex justify-end gap-2 grid-flow-col col-span-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEstablishFlowRateDialog(true)}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Establish Flow Rate
              </Button>
              {hasUnsavedChanges && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (initialApiState) {
                        setPortConfig({ ...initialApiState });
                      }
                    }}
                    disabled={isSaving || !initialApiState}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSaveWithConfirmation}
                    disabled={!hasUnsavedChanges || isSaving}
                    variant="primary"
                    size="sm"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(portsByBank)
              .sort(([a], [b]) => {
                // Sort bank 0 (Ambient) first, then others
                if (a === "0") return -1;
                if (b === "0") return 1;
                return Number(a) - Number(b);
              })
              .map(([bankNumber, bankPorts]) => (
                <div
                  key={bankNumber}
                  className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900"
                >
                  <div className="flex justify-between items-center mb-4 pb-3 border-neutral-200 dark:border-neutral-700 border-b">
                    <h3 className="flex items-center gap-2 font-semibold text-neutral-700 dark:text-neutral-300">
                      {bankNumber === "0" ? "Special" : `Bank ${bankNumber}`}
                    </h3>
                    <div className="bg-neutral-50 dark:bg-neutral-900 px-2 py-1 border border-neutral-200 dark:border-neutral-700 rounded-full text-neutral-500 dark:text-neutral-400 text-xs">
                      {bankPorts.length} ports
                    </div>
                  </div>
                  <div className="gap-3 grid grid-cols-2">
                    {bankPorts.map((port) => (
                      <div
                        key={port.id}
                        className={`border rounded-lg p-3 transition-all duration-200 ${
                          editingPort === port.portNumber
                            ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                            : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm"
                        } ${
                          !port.enabled
                            ? "opacity-60 bg-neutral-50 dark:bg-neutral-800"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                              <div className="bg-neutral-400 dark:bg-neutral-500 rounded-full w-2 h-2"></div>
                              Port #{port.portNumber}
                            </div>

                            <div className="mt-1 text-neutral-500 dark:text-neutral-400 text-sm">
                              {editingPort === port.portNumber ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={editValue}
                                      onChange={(e) =>
                                        setEditValue(e.target.value)
                                      }
                                      onKeyDown={(e) =>
                                        handleKeyPress(e, port.portNumber)
                                      }
                                      className="flex-1 border-blue-200 dark:border-blue-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400 dark:focus:ring-blue-500 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 h-7 text-xs"
                                      autoFocus
                                      placeholder="Enter port label..."
                                      maxLength={20}
                                    />
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          handleEditSave(port.portNumber);
                                        }}
                                        disabled={
                                          !editValue ||
                                          editValue === "" ||
                                          editValue === originalValue
                                        }
                                        className="hover:bg-primary-50 p-0 border-primary-200 hover:border-primary-300 w-7 h-7 text-primary-600"
                                        title="Save changes"
                                      >
                                        <Check className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          handleResetToOriginal();
                                        }}
                                        className="hover:bg-yellow-50 p-0 border-yellow-200 hover:border-yellow-300 w-7 h-7 text-yellow-600"
                                        title="Reset to original"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          handleEditCancel();
                                        }}
                                        className="hover:bg-red-50 p-0 border-red-200 hover:border-red-300 w-7 h-7 text-red-600"
                                        title="Cancel editing"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 text-xs">
                                    <span>
                                      Press Enter to save, Esc to cancel
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors">
                                    {port.name}
                                  </span>
                                  {!isAmbientPort(port.portNumber) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleEditStart(
                                          port.portNumber,
                                          port.name
                                        )
                                      }
                                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20 p-0 w-5 h-5 text-neutral-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                      <Edit3 className="w-3 h-3 dark:text-yellow-500/70" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {editingPort !== port.portNumber && (
                              <Switch
                                checked={portEnabled[port.portNumber] === true}
                                onCheckedChange={(checked) => {
                                  // Prevent disabling Ambient port
                                  if (isAmbientPort(port.portNumber)) {
                                    return;
                                  }
                                  setPortEnabled((prev) => {
                                    const newState = {
                                      ...prev,
                                      [port.portNumber]: checked
                                    };
                                    return newState;
                                  });
                                }}
                                disabled={isAmbientPort(port.portNumber)}
                                className="data-[state=checked]:bg-primary-500"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Establish Flow Rate Confirmation Dialog */}
      <AlertDialog
        open={showEstablishFlowRateDialog}
        onOpenChange={setShowEstablishFlowRateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Establish Flow Rate
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action will establish flow rate for all sampling lines.
                <strong className="text-red-600">
                  {" "}
                  Running recipe will be interrupted.
                </strong>
              </p>
              <p className="text-gray-600 text-sm">
                Optimize flow rate each time the sampling line is changed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowEstablishFlowRateDialog(false);
                handleEstablishFlowRate();
              }}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Establish Flow Rate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save with Flow Rate Confirmation Dialog */}
      <AlertDialog
        open={showSaveConfirmationDialog}
        onOpenChange={setShowSaveConfirmationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Port Status Changes Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You have changed port status settings. Saving these changes will
                trigger
                <strong className="text-yellow-600">
                  {" "}
                  Establish Flow Rate
                </strong>{" "}
                to run, which will{" "}
                <strong className="text-red-600">
                  interrupt all running jobs.
                </strong>
              </p>
              <p className="text-gray-600 text-sm">
                Optimize flow rate each time the sampling line is changed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSaveConfirmationDialog(false);
                handleSaveAllChanges();
              }}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Save & Establish Flow Rate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
