import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Port, getPortDisplayName } from "@/types/common/ports";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Boundary, PreviewPortMarker } from "../types";
import { isPointInPolygon } from "../utils/mapUtils";
import { PortSelectionComponent } from "./PortSelection";

interface PortControlsProps {
  isAddingPort: boolean;
  availablePorts: Port[];
  selectedPort: Port | null;
  pendingPortPlacements: PreviewPortMarker[];
  boundaries: Boundary[];
  onPortSelect: (port: Port) => void;
  onSavePortPlacements: () => void;
  onRemovePendingPort: (id: string) => void;
  onUpdatePendingPortCoordinates: (
    id: string,
    coordinates: { x: number; y: number }
  ) => void;
  onCancelAddPort: () => void;
}

export const PortControls = ({
  isAddingPort,
  availablePorts,
  selectedPort,
  pendingPortPlacements,
  boundaries,
  onPortSelect,
  onSavePortPlacements,
  onRemovePendingPort,
  onUpdatePendingPortCoordinates,
  onCancelAddPort
}: PortControlsProps) => {
  const [editingPortId, setEditingPortId] = useState<string | null>(null);
  const [editCoordinates, setEditCoordinates] = useState<{
    x: string;
    y: string;
  }>({ x: "", y: "" });

  const handleEditPort = (previewMarker: PreviewPortMarker) => {
    setEditingPortId(previewMarker.id);
    setEditCoordinates({
      x: previewMarker.coordinates.x.toFixed(4),
      y: previewMarker.coordinates.y.toFixed(4)
    });
  };

  const handleSaveEdit = () => {
    if (editingPortId && editCoordinates.x && editCoordinates.y) {
      const x = parseFloat(editCoordinates.x);
      const y = parseFloat(editCoordinates.y);
      if (!isNaN(x) && !isNaN(y)) {
        // Round to 4 decimal places
        const roundedX = Math.round(x * 10000) / 10000;
        const roundedY = Math.round(y * 10000) / 10000;
        onUpdatePendingPortCoordinates(editingPortId, {
          x: roundedX,
          y: roundedY
        });
        setEditingPortId(null);
        setEditCoordinates({ x: "", y: "" });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPortId(null);
    setEditCoordinates({ x: "", y: "" });
  };

  // Check if all pending ports are within valid boundaries
  const areAllPortsInBoundaries = () => {
    if (uniquePendingPorts.length === 0) return true;

    return uniquePendingPorts.every((previewMarker) => {
      const boundary = boundaries.find(
        (b) => b.id === previewMarker.boundaryId
      );
      if (!boundary || boundary.points.length < 3) return false;

      return isPointInPolygon(previewMarker.coordinates, boundary.points);
    });
  };

  // Check if save button should be disabled
  const isSaveDisabled = () => {
    return editingPortId !== null || !areAllPortsInBoundaries();
  };

  if (!isAddingPort) return null;

  // Filter out any duplicates that might have slipped through
  const uniquePendingPorts = pendingPortPlacements.filter(
    (marker, index, array) =>
      array.findIndex((m) => m.port.id === marker.port.id) === index
  );

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      {/* Port Selection Section */}
      <div className="mb-4">
        <PortSelectionComponent
          availablePorts={availablePorts}
          selectedPort={selectedPort}
          onPortSelect={onPortSelect}
        />
      </div>

      {/* Pending Ports Section */}
      {uniquePendingPorts.length > 0 && (
        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-600">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded bg-orange-100 p-1 dark:bg-orange-900/30">
              <Plus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              Pending ({uniquePendingPorts.length})
            </h4>
          </div>

          <div className="max-h-48 space-y-2 overflow-y-auto">
            {uniquePendingPorts.map((previewMarker) => (
              <div
                key={previewMarker.id}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-600 dark:bg-neutral-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/90 text-xs font-bold text-white">
                      {previewMarker.port.portNumber}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {getPortDisplayName(previewMarker.port)}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {previewMarker.boundaryName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {editingPortId === previewMarker.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveEdit}
                          className=" text-primary-600 hover:bg-primary-100 hover:text-primary-700 dark:text-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className=" text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPort(previewMarker)}
                          className=" text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemovePendingPort(previewMarker.id)}
                          className=" text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit Mode */}
                {editingPortId === previewMarker.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 block">
                          X Coordinate
                        </label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={editCoordinates.x}
                          onChange={(e) =>
                            setEditCoordinates((prev) => ({
                              ...prev,
                              x: e.target.value
                            }))
                          }
                          className="h-8 text-xs min-w-0"
                          placeholder="X"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 block">
                          Y Coordinate
                        </label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={editCoordinates.y}
                          onChange={(e) =>
                            setEditCoordinates((prev) => ({
                              ...prev,
                              y: e.target.value
                            }))
                          }
                          className="h-8 text-xs min-w-0"
                          placeholder="Y"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    Coordinates: ({previewMarker.coordinates.x.toFixed(4)},{" "}
                    {previewMarker.coordinates.y.toFixed(4)})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex w-full gap-2">
        {uniquePendingPorts.length > 0 && (
          <Button
            variant="primary"
            onClick={onSavePortPlacements}
            disabled={isSaveDisabled()}
            className="flex-1"
          >
            Save {uniquePendingPorts.length} Port
            {uniquePendingPorts.length > 1 ? "s" : ""}
          </Button>
        )}
        <Button variant="outline" onClick={onCancelAddPort} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};
