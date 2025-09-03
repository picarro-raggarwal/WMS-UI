import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertOctagon, AlertTriangle, Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CompoundThresholds,
  Threshold,
  compounds,
  generateMockCompoundThresholds,
  portCount
} from "../data/species-threshold-mock-data";
import {
  validatePortThreshold,
  validateThreshold
} from "./species-threshold-utils";

// Port Component
interface PortProps {
  portNumber: number;
  compound: string;
  portThreshold: {
    warning: number | null;
    alarm: number | null;
  };
  inlineEditing: {
    compound: string;
    port: number;
    type: "warning" | "alarm";
    value: string;
  } | null;
  isUpdated: boolean;
  onStartInlineEdit: (
    compound: string,
    portNumber: number,
    type: "warning" | "alarm"
  ) => void;
  onInlineEditChange: (value: string) => void;
  onSaveInlineEdit: () => void;
  onCancelInlineEdit: () => void;
  onKeyDown: (
    e: React.KeyboardEvent,
    compound: string,
    portNumber: number
  ) => void;
}

const Port = ({
  portNumber,
  compound,
  portThreshold,
  inlineEditing,
  isUpdated,
  onStartInlineEdit,
  onInlineEditChange,
  onSaveInlineEdit,
  onCancelInlineEdit,
  onKeyDown
}: PortProps) => {
  const isEditingWarning =
    inlineEditing?.compound === compound &&
    inlineEditing?.port === portNumber &&
    inlineEditing?.type === "warning";

  const isEditingAlarm =
    inlineEditing?.compound === compound &&
    inlineEditing?.port === portNumber &&
    inlineEditing?.type === "alarm";

  return (
    <div
      className={`text-center p-2 border rounded transition-all cursor-pointer ${
        isUpdated
          ? "border-green-400 bg-green-50"
          : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
      }`}
    >
      <div className="mb-1 text-gray-500 text-xs">Port {portNumber}</div>

      <div className="font-medium text-xs">
        <div className="flex justify-center items-center gap-1">
          {isEditingWarning && inlineEditing ? (
            <input
              // type="number"
              value={inlineEditing.value}
              onChange={(e) => onInlineEditChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSaveInlineEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onCancelInlineEdit();
                }
              }}
              onBlur={onSaveInlineEdit}
              className="border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 w-10 h-6 text-xs text-center"
              placeholder="W"
              min={0}
              max={1000}
              step="0.1"
              autoFocus
            />
          ) : (
            <span
              className="hover:bg-gray-200 px-1 py-0.5 rounded transition-colors cursor-pointer"
              onClick={() => onStartInlineEdit(compound, portNumber, "warning")}
              onDoubleClick={() =>
                onStartInlineEdit(compound, portNumber, "warning")
              }
              onKeyDown={(e) => onKeyDown(e, compound, portNumber)}
              tabIndex={0}
              role="button"
              aria-label={`Edit warning threshold for port ${portNumber}`}
            >
              {portThreshold.warning !== null ? portThreshold.warning : "—"}
            </span>
          )}

          <span>/</span>

          {isEditingAlarm && inlineEditing ? (
            <input
              // type="number"
              value={inlineEditing.value}
              onChange={(e) => onInlineEditChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSaveInlineEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onCancelInlineEdit();
                }
              }}
              onBlur={onSaveInlineEdit}
              className="border border-red-300 rounded focus:outline-none focus:ring-1 focus:ring-red-400 w-10 h-6 text-xs text-center"
              placeholder="A"
              min={0}
              max={1000}
              step="0.1"
              autoFocus
            />
          ) : (
            <span
              className="hover:bg-gray-200 px-1 py-0.5 rounded transition-colors cursor-pointer"
              onClick={() => onStartInlineEdit(compound, portNumber, "alarm")}
              onDoubleClick={() =>
                onStartInlineEdit(compound, portNumber, "alarm")
              }
              onKeyDown={(e) => onKeyDown(e, compound, portNumber)}
              tabIndex={0}
              role="button"
              aria-label={`Edit alarm threshold for port ${portNumber}`}
            >
              {portThreshold.alarm !== null ? portThreshold.alarm : "—"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const SpeciesThresholdTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCompound, setEditingCompound] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Threshold>({
    warning: null,
    alarm: null
  });

  const [editingPortValues, setEditingPortValues] = useState<Threshold>({
    warning: null,
    alarm: null
  });
  const [inlineEditing, setInlineEditing] = useState<{
    compound: string;
    port: number;
    type: "warning" | "alarm";
    value: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // const [updatedPorts, setUpdatedPorts] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editedPorts, setEditedPorts] = useState<Set<string>>(new Set());

  // Ref for the port grid container
  const portGridRef = useRef<HTMLDivElement>(null);

  // Initialize port thresholds with mock data
  const [portThresholds, setPortThresholds] = useState<CompoundThresholds>(
    () => {
      const mockData = generateMockCompoundThresholds();
      return mockData;
    }
  );

  // Store original values for comparison
  const [originalPortThresholds, setOriginalPortThresholds] =
    useState<CompoundThresholds>(() => {
      const mockData = generateMockCompoundThresholds();
      return mockData;
    });

  // Handle clicks outside the port grid to exit edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        portGridRef.current &&
        !portGridRef.current.contains(event.target as Node)
      ) {
        if (inlineEditing) {
          // Save the value when clicking outside
          const { compound, port, type, value } = inlineEditing;
          const numValue = value === "" ? null : parseFloat(value);

          // Validate the value using utility function
          const currentThreshold = portThresholds[compound]?.[port];
          if (!currentThreshold) {
            console.error(
              `No threshold data found for compound ${compound} port ${port}`
            );
            return;
          }
          const errorMessage = validatePortThreshold(
            type,
            numValue,
            currentThreshold
          );

          if (errorMessage) {
            const originalValue = portThresholds[compound][port][type];
            setInlineEditing((prev) =>
              prev
                ? {
                    ...prev,
                    value:
                      originalValue !== null ? originalValue.toString() : ""
                  }
                : null
            );

            // Keep input open for correction
            return;
          }

          // Check if value actually changed from original
          const originalValue = portThresholds[compound]?.[port]?.[type];
          if (originalValue === undefined) {
            console.error(
              `No original value found for compound ${compound} port ${port} type ${type}`
            );
            return;
          }
          const hasValueChanged = originalValue !== numValue;

          // If validation passes, update the threshold
          setPortThresholds((prev) => ({
            ...prev,
            [compound]: {
              ...prev[compound],
              [port]: {
                ...prev[compound][port],
                [type]: numValue
              }
            }
          }));

          // Clear any existing errors
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`${compound}-${port}`];
            return newErrors;
          });

          // Only mark as updated if value actually changed
          if (hasValueChanged) {
            setEditedPorts((prev) => {
              const newSet = new Set(prev);
              newSet.add(`${compound}-${port}`);
              return newSet;
            });
          }

          // No success toast - just close edit mode
          setInlineEditing(null);
        } else {
          // If validation fails, keep the input open with error state
          // Don't close inlineEditing, just set the error
          // The input will remain open showing the invalid value
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inlineEditing]); // Removed portThresholds dependency to prevent infinite re-renders

  const filteredCompounds = compounds.filter((compound) =>
    compound.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateThresholds = (
    warning: number | null,
    alarm: number | null
  ): string | null => {
    return validateThreshold(warning, alarm);
  };

  const handleEditClick = (compound: string) => {
    setEditingCompound(compound);
    // Initialize editing values with current compound values
    const currentCompound = portThresholds[compound];
    if (currentCompound) {
      // Get the first port's values as a reference (all ports should have same values)
      const firstPort = currentCompound[1];
      if (firstPort) {
        setEditingValues({
          warning: firstPort.warning,
          alarm: firstPort.alarm
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCompound(null);
    setEditingValues({ warning: null, alarm: null });
    setErrors({});
    // Reset applied actions when canceling edit mode
  };

  const handlePortEditCancel = () => {
    setEditingPortValues({ warning: null, alarm: null });
    setErrors({});
  };

  const handlePortSave = (compound: string, portNumber: number) => {
    // Validate and save on blur
    const validationError = validateThresholds(
      editingPortValues.warning,
      editingPortValues.alarm
    );
    console.log("validationError", validationError);

    if (validationError) {
      // Set error in state for display
      setErrors({ ...errors, [`${compound}-${portNumber}`]: validationError });
      return;
    }

    // Additional validation checks
    if (
      editingPortValues.warning !== null &&
      editingPortValues.warning > 1000
    ) {
      setErrors({
        ...errors,
        [`${compound}-${portNumber}`]: "Warning value cannot exceed 1000"
      });
      return;
    }

    if (editingPortValues.alarm !== null && editingPortValues.alarm > 1000) {
      setErrors({
        ...errors,
        [`${compound}-${portNumber}`]: "Alarm value cannot exceed 1000"
      });
      return;
    }

    // If we reach here, validation passed - update port thresholds
    setPortThresholds((prev) => ({
      ...prev,
      [portNumber]: {
        ...prev[portNumber],
        [compound]: editingPortValues
      }
    }));

    // Track that this port has been edited by the user
    const portKey = `${compound}-${portNumber}`;
    setEditedPorts((prev) => {
      const newSet = new Set(prev);
      newSet.add(portKey);
      return newSet;
    });

    // Clear any existing errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${compound}-${portNumber}`];
      return newErrors;
    });

    toast.success(`Port ${portNumber} thresholds updated for ${compound}`);

    // Auto-close edit mode on successful save
    setEditingPortValues({ warning: null, alarm: null });
  };

  const handlePortKeyDown = (
    e: React.KeyboardEvent,
    compound: string,
    portNumber: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePortSave(compound, portNumber);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handlePortEditCancel();
    }
  };

  const startInlineEdit = (
    compound: string,
    portNumber: number,
    type: "warning" | "alarm"
  ) => {
    const currentValue = portThresholds[compound]?.[portNumber]?.[type];
    if (currentValue === undefined) {
      console.error(
        `No current value found for compound ${compound} port ${portNumber} type ${type}`
      );
      return;
    }
    setInlineEditing({
      compound,
      port: portNumber,
      type,
      value: currentValue !== null ? currentValue.toString() : ""
    });
  };

  const handleInlineEditChange = (value: string) => {
    if (inlineEditing) {
      const numericValue = value === "" ? "" : value.replace(/[^0-9.]/g, ""); // Remove non-numeric characters
      setInlineEditing((prev) =>
        prev ? { ...prev, value: numericValue } : null
      );
    }
  };

  const saveInlineEdit = () => {
    if (!inlineEditing) return;

    const { compound, port, type, value } = inlineEditing;
    const numValue = value === "" ? null : parseFloat(value);

    // Validate the value using utility function
    const currentThreshold = portThresholds[compound]?.[port];
    if (!currentThreshold) {
      console.error(
        `No threshold data found for compound ${compound} port ${port}`
      );
      return;
    }
    const errorMessage = validatePortThreshold(
      type,
      numValue,
      currentThreshold
    );

    // If there's an error, show toast and reset to original value
    if (errorMessage) {
      toast.info(errorMessage);

      // Reset to original value with delay to prevent toast overwriting
      const originalValue = portThresholds[compound]?.[port]?.[type];

      setInlineEditing((prev) =>
        prev
          ? {
              ...prev,
              value: originalValue !== null ? originalValue.toString() : ""
            }
          : null
      );

      // Keep input open for correction
      return;
    }

    // Update the threshold
    setPortThresholds((prev) => {
      return {
        ...prev,
        [compound]: {
          ...prev[compound],
          [port]: {
            ...prev[compound][port],
            [type]: numValue
          }
        }
      };
    });

    // Check if value actually changed from original
    const originalValue = portThresholds[compound]?.[port]?.[type];

    if (originalValue === undefined) {
      console.error(
        `No original value found for compound ${compound} port ${port} type ${type}`
      );
      return;
    }
    const hasValueChanged = originalValue !== numValue;

    // Clear any existing errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${compound}-${port}`];
      return newErrors;
    });

    // Only mark as updated if value actually changed
    console.log("hasValueChanged", hasValueChanged);
    if (hasValueChanged) {
      setEditedPorts((prev) => {
        const newSet = new Set(prev);
        newSet.add(`${compound}-${port}`);
        return newSet;
      });
    }

    // No success toast - just close edit mode
    setInlineEditing(null);
  };

  const cancelInlineEdit = () => {
    setInlineEditing(null);
  };

  const handleThresholdChange = (type: "warning" | "alarm", value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    setEditingValues((prev) => ({
      ...prev,
      [type]: numValue
    }));

    // Clear error when user starts editing
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const handleSaveCompound = (compound: string) => {
    const validationError = validateThresholds(
      editingValues.warning,
      editingValues.alarm
    );

    if (validationError) {
      setErrors({ ...errors, [compound]: validationError });
      return;
    }

    // Update all ports for this compound with the new values
    setPortThresholds((prev) => {
      const updated = { ...prev };
      const compoundThresholds = { ...updated[compound] };

      for (let port = 1; port <= portCount; port++) {
        compoundThresholds[port] = {
          warning: editingValues.warning,
          alarm: editingValues.alarm
        };
      }

      updated[compound] = compoundThresholds;
      return updated;
    });

    // Track that all ports for this compound have been edited
    const newEditedPorts = new Set(editedPorts);
    for (let port = 1; port <= portCount; port++) {
      newEditedPorts.add(`${compound}-${port}`);
    }
    setEditedPorts(newEditedPorts);

    // Show success message
    const action =
      editingValues.warning === null && editingValues.alarm === null
        ? "cleared"
        : "updated";
    toast.success(`All ports ${action} for ${compound}`);

    // Exit edit mode
    handleCancelEdit();
  };

  const clearAllForCompound = (compound: string) => {
    setPortThresholds((prev) => {
      const updated = { ...prev };
      const compoundThresholds = { ...updated[compound] };

      for (let port = 1; port <= portCount; port++) {
        compoundThresholds[port] = {
          warning: null,
          alarm: null
        };
      }

      updated[compound] = compoundThresholds;
      return updated;
    });

    // Track that all ports for this compound have been edited
    const newEditedPorts = new Set(editedPorts);
    for (let port = 1; port <= portCount; port++) {
      newEditedPorts.add(`${compound}-${port}`);
    }
    setEditedPorts(newEditedPorts);

    // toast.success(`All ports cleared for ${compound}`);
  };

  // Function to check if a port has been updated by comparing with original values
  const isPortUpdated = (compound: string, portNumber: number): boolean => {
    // Check if this port has been edited by the user
    const portKey = `${compound}-${portNumber}`;

    // Safety check: ensure editedPorts is always a Set
    if (!(editedPorts instanceof Set)) {
      console.error("editedPorts is not a Set:", editedPorts);
      // Reset to a proper Set
      setEditedPorts(new Set());
      return false;
    }

    const isUpdated = editedPorts.has(portKey);

    return isUpdated;
  };

  // Function to check if there are any unsaved changes
  const hasUnsavedChanges = (): boolean => {
    // Safety check: ensure editedPorts is always a Set
    if (!(editedPorts instanceof Set)) {
      console.error(
        "hasUnsavedChanges: editedPorts is not a Set:",
        editedPorts
      );
      // Reset to a proper Set
      setEditedPorts(new Set());
      return false;
    }
    return editedPorts.size > 0;
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update original values to current values after successful save
      setOriginalPortThresholds(portThresholds);

      // Clear all edited port tracking after successful save
      setEditedPorts(new Set());

      toast.success("All species thresholds saved successfully!");
    } catch (error) {
      toast.error("Failed to save species thresholds");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className=" justify-between items-start gap-4 grid grid-cols-4">
            <div className="flex flex-col grid-flow-col col-span-3">
              <CardTitle className="mb-2 text-lg">
                Species Threshold Configuration
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Configure warning and alarm thresholds for different compounds
                across all ports. Click on any port to edit its thresholds
                individually.
              </p>
            </div>

            <div className="flex gap-2 grid-flow-col col-span-1 justify-end">
              {hasUnsavedChanges() && (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPortThresholds(originalPortThresholds);
                      setEditedPorts(new Set());
                    }}
                    variant="outline"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveAll}
                    disabled={isSaving || !hasUnsavedChanges()}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Actions */}
          <div className="flex justify-between items-center mb-4 gap-2">
            <div className="relative flex-1 ">
              <Search className="top-[calc(50%-9px)] left-3 z-10 absolute w-4 h-4 text-neutral-500" />
              <Input
                placeholder="Filter by compound name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6"
              />
            </div>
          </div>

          {/* Compounds List */}
          <div className="space-y-6">
            {filteredCompounds.length === 0 ? (
              <div className="py-12 text-muted-foreground text-base text-center">
                {searchQuery
                  ? "No compounds match your search."
                  : "No compounds available for threshold configuration."}
              </div>
            ) : (
              filteredCompounds.map((compound) => {
                const editing = editingCompound === compound;

                const hasError = errors[compound];

                return (
                  <div key={compound} className="space-y-3">
                    <div className="bg-white dark:bg-neutral-900 p-6 border dark:border-neutral-700/50 rounded-lg">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="font-semibold text-base">
                            {compound}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            Compound • ppm
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {editing ? (
                            <>
                              <Button
                                onClick={() => handleSaveCompound(compound)}
                                variant="primary"
                                size="sm"
                                disabled={
                                  editingValues.warning === null &&
                                  editingValues.alarm === null
                                }
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(compound)}
                            >
                              Edit All Ports
                            </Button>
                          )}
                        </div>
                      </div>

                      {editing ? (
                        <div className="space-y-4 ">
                          <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg text-gray-500 text-xs">
                            ⚠️{" "}
                            <strong>
                              Save Changes will overwrite all port values
                            </strong>{" "}
                            with the values in the input fields above. This
                            action cannot be undone and will replace any custom
                            thresholds you've set for individual ports.
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                              <label className="flex items-center gap-2 font-medium text-yellow-600 text-sm">
                                <AlertTriangle size={14} />
                                Warning Level
                              </label>
                              <Input
                                type="number"
                                value={editingValues.warning || ""}
                                onChange={(e) =>
                                  handleThresholdChange(
                                    "warning",
                                    e.target.value
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                                className="w-full"
                                step="0.1"
                                placeholder="Enter warning threshold (ppm)"
                                min={0}
                              />
                            </div>

                            <div className="flex-1 space-y-2">
                              <label className="flex items-center gap-2 font-medium text-red-600 text-sm">
                                <AlertOctagon size={14} />
                                Alarm Level
                              </label>
                              <Input
                                type="number"
                                value={editingValues.alarm || ""}
                                onChange={(e) =>
                                  handleThresholdChange("alarm", e.target.value)
                                }
                                onFocus={(e) => e.target.select()}
                                className="w-full"
                                step="0.1"
                                placeholder="Enter alarm threshold (ppm)"
                                min={0}
                              />
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Error display */}
                      {hasError && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertTriangle className="w-4 h-4" />
                          <AlertTitle>{hasError}</AlertTitle>
                        </Alert>
                      )}

                      {/* Port Management Section */}
                      {!editing && (
                        <div className="">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                Port Management
                              </h4>
                              <p className="mt-1 text-gray-500 text-xs">
                                Managing thresholds for {portCount} ports
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => clearAllForCompound(compound)}
                                variant="outline"
                                size="sm"
                              >
                                Clear All Ports
                              </Button>
                            </div>
                          </div>

                          {/* Port Editing Instructions */}
                          <div className="mt-2 mb-4 text-gray-500 text-xs">
                            💡 Click on any port to edit its thresholds
                            individually
                          </div>

                          {/* Port Grid */}
                          <div
                            ref={portGridRef}
                            className="gap-2 grid grid-cols-6 max-h-48 overflow-y-auto"
                          >
                            {Array.from({ length: portCount }, (_, index) => {
                              const portNumber = index + 1;
                              const portThreshold =
                                portThresholds[compound]?.[portNumber];

                              // Skip rendering if port threshold data is missing
                              if (!portThreshold) {
                                console.warn(
                                  `Missing port threshold data for compound ${compound} port ${portNumber}`
                                );
                                return null;
                              }

                              // const isEditingPort =
                              //   editingPort?.compound === compound &&
                              //   editingPort?.port === portNumber;
                              const isUpdated = isPortUpdated(
                                compound,
                                portNumber
                              );

                              return (
                                <Port
                                  key={portNumber}
                                  portNumber={portNumber}
                                  compound={compound}
                                  portThreshold={portThreshold}
                                  inlineEditing={inlineEditing}
                                  isUpdated={isUpdated}
                                  onStartInlineEdit={startInlineEdit}
                                  onInlineEditChange={handleInlineEditChange}
                                  onSaveInlineEdit={saveInlineEdit}
                                  onCancelInlineEdit={cancelInlineEdit}
                                  onKeyDown={handlePortKeyDown}
                                />
                              );
                            })}
                          </div>

                          {/* Help text for inline editing */}
                          {inlineEditing && (
                            <div className="mt-3 text-gray-500 text-xs text-center">
                              💡 Type value • Press Enter to save • Press Esc to
                              cancel • Click outside to save
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
