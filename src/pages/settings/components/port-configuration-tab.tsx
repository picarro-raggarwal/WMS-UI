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
  generateAllPorts,
  getPortsByBank,
  mockStepNames
} from "@/types/common/ports";
import { Check, Edit3, RotateCcw, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Port {
  id: string;
  portNumber: number;
  name: string;
  bankNumber: number;
  enabled: boolean;
  type: "regular";
}

export const PortConfigurationTab = () => {
  // Store the original mock data separately
  const [originalMockNames] = useState<Record<number, string>>(() => {
    const initialNames: Record<number, string> = {};
    for (let i = 1; i <= 64; i++) {
      initialNames[i] = mockStepNames[i] || `Port ${i}`;
    }
    return initialNames;
  });

  const [portNames, setPortNames] = useState<Record<number, string>>(() => {
    // Initialize with mock data
    const initialNames: Record<number, string> = {};
    for (let i = 1; i <= 64; i++) {
      initialNames[i] = mockStepNames[i] || `Port ${i}`;
    }
    return initialNames;
  });

  const [portEnabled, setPortEnabled] = useState<Record<number, boolean>>(
    () => {
      // Initialize all ports as enabled
      const initialEnabled: Record<number, boolean> = {};
      for (let i = 1; i <= 64; i++) {
        initialEnabled[i] = true;
      }
      return initialEnabled;
    }
  );

  const [editingPort, setEditingPort] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [showEstablishFlowRateDialog, setShowEstablishFlowRateDialog] =
    useState(false);
  const [showSaveConfirmationDialog, setShowSaveConfirmationDialog] =
    useState(false);

  // Track the last saved state to determine unsaved changes
  const [lastSavedNames, setLastSavedNames] = useState<Record<number, string>>(
    () => {
      const initialNames: Record<number, string> = {};
      for (let i = 1; i <= 64; i++) {
        initialNames[i] = mockStepNames[i] || `Port ${i}`;
      }
      return initialNames;
    }
  );

  const [lastSavedEnabled, setLastSavedEnabled] = useState<
    Record<number, boolean>
  >(() => {
    const initialEnabled: Record<number, boolean> = {};
    for (let i = 1; i <= 64; i++) {
      initialEnabled[i] = true;
    }
    return initialEnabled;
  });

  // Debug portEnabled state changes
  useEffect(() => {
    // Removed console log
  }, [portEnabled]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    // Check if any port names have changed from last saved state
    for (let i = 1; i <= 64; i++) {
      if (portNames[i] !== lastSavedNames[i]) {
        return true;
      }
    }
    // Check if any port enabled status has changed from last saved state
    for (let i = 1; i <= 64; i++) {
      if (portEnabled[i] !== lastSavedEnabled[i]) {
        return true;
      }
    }
    return false;
  }, [portNames, portEnabled, lastSavedNames, lastSavedEnabled]);

  const handleSaveAllChanges = async () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      // Console all changes
      console.log("🚀 Saving Port Configuration Changes:");
      console.log("📝 Port Name Changes:", portNames);
      console.log("🔌 Port Enable/Disable Changes:", portEnabled);

      // Log what changed from last saved state
      const nameChanges = Object.entries(portNames).filter(
        ([portNum, name]) => name !== lastSavedNames[parseInt(portNum)]
      );
      const enableChanges = Object.entries(portEnabled).filter(
        ([portNum, enabled]) => enabled !== lastSavedEnabled[parseInt(portNum)]
      );

      if (nameChanges.length > 0) {
        console.log("✏️ Modified Port Labels:", nameChanges);
      }
      if (enableChanges.length > 0) {
        console.log(
          "🔒 Disabled Ports:",
          enableChanges.map(([portNum]) => parseInt(portNum))
        );
      }

      // TODO: Implement network call to save changes
      // Example: await savePortConfiguration({ portNames, portEnabled })

      // Simulate network call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success toast
      console.log("✅ Port configuration saved successfully!");
      toast.success("Port configuration saved successfully!");

      // Update the last saved state to current values
      setLastSavedNames({ ...portNames });
      setLastSavedEnabled({ ...portEnabled });
    } catch (error) {
      console.error("❌ Failed to save port configuration:", error);
      toast.error("Failed to save port configuration. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEstablishFlowRate = async () => {
    try {
      console.log("🚀 Starting Establish Flow Rate process...");

      // TODO: Implement actual establish flow rate API call
      // Example: await establishFlowRate()

      // Simulate network call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("✅ Establish Flow Rate completed successfully!");
      toast.success("Flow rate established successfully!");
    } catch (error) {
      console.error("❌ Failed to establish flow rate:", error);
      toast.error("Failed to establish flow rate. Please try again.");
    }
  };

  const handleSaveWithConfirmation = () => {
    // Check if any port enabled status has changed
    const hasPortStatusChanges = Object.entries(portEnabled).some(
      ([portNum, enabled]) => enabled !== lastSavedEnabled[parseInt(portNum)]
    );

    if (hasPortStatusChanges) {
      setShowSaveConfirmationDialog(true);
    } else {
      handleSaveAllChanges();
    }
  };

  // Generate ports data using common configuration
  const basePorts = useMemo(() => generateAllPorts(), []);

  const ports = useMemo((): Port[] => {
    return basePorts.map((port) => {
      // If this port is currently being edited, use the editValue
      // Otherwise use the stored portNames value
      let displayName: string;
      if (editingPort === port.portNumber) {
        displayName = editValue;
      } else {
        displayName = portNames[port.portNumber] || port.name;
      }

      return {
        id: port.id,
        portNumber: port.portNumber,
        name: displayName,
        bankNumber: port.bankNumber,
        enabled: portEnabled[port.portNumber] || true, // Use portEnabled state
        type: "regular" as const
      };
    });
  }, [basePorts, editingPort, editValue, portNames, portEnabled]);

  const portsByBank = useMemo(() => getPortsByBank(ports), [ports]);

  const handleEditStart = (portNumber: number, currentName: string) => {
    setEditingPort(portNumber);
    setEditValue(currentName);
    // Always use the original mock data value for reset
    setOriginalValue(originalMockNames[portNumber]);
  };

  const handleEditSave = (portNumber: number) => {
    const trimmedValue = editValue.trim();

    // Validation checks
    if (!trimmedValue) {
      return; // Don't save empty labels, but don't show error
    }

    if (trimmedValue.length > 20) {
      toast.error("Port label cannot exceed 20 characters");
      return;
    }

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
      // Don't update portNames state - only update the input field
      // This way the reset is visible in the input but doesn't affect the displayed ports
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, portNumber: number) => {
    if (e.key === "Enter") {
      handleEditSave(portNumber);
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

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
                      setPortNames(lastSavedNames);
                      setPortEnabled(lastSavedEnabled);
                    }}
                    disabled={isSaving}
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
            {Object.entries(portsByBank).map(([bankNumber, bankPorts]) => (
              <div
                key={bankNumber}
                className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900"
              >
                <div className="flex justify-between items-center mb-4 pb-3 border-neutral-200 dark:border-neutral-700 border-b">
                  <h3 className="flex items-center gap-2 font-semibold text-neutral-700 dark:text-neutral-300">
                    Bank {bankNumber}
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditStart(port.portNumber, port.name)
                                  }
                                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 p-0 w-5 h-5 text-neutral-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  <Edit3 className="w-3 h-3 dark:text-yellow-500/70" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingPort !== port.portNumber && (
                            <Switch
                              checked={portEnabled[port.portNumber] === true}
                              onCheckedChange={(checked) => {
                                setPortEnabled((prev) => {
                                  const newState = {
                                    ...prev,
                                    [port.portNumber]: checked
                                  };
                                  return newState;
                                });
                              }}
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
