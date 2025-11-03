import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPortDisplayName } from "@/types/common/ports";
import { Check, Edit2, Info, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Boundary, PortMarker } from "../types";
import {
  getBoundaryTypeLabel,
  getPortStatusColorClass,
  hasBoundaryPorts,
  isPointInPolygon
} from "../utils/mapUtils";

interface BoundaryDetailsProps {
  selectedBoundary: Boundary | null;
  portMarkers: PortMarker[];
  onDeleteBoundary: (id: string) => void;
  onDeletePortMarker: (markerId: string) => void;
  onUpdatePortMarkerCoordinates: (
    markerId: string,
    coordinates: { x: number; y: number }
  ) => void;
}

export const BoundaryDetails = ({
  selectedBoundary,
  portMarkers,
  onDeleteBoundary,
  onDeletePortMarker,
  onUpdatePortMarkerCoordinates
}: BoundaryDetailsProps) => {
  const [editingPortId, setEditingPortId] = useState<string | null>(null);
  const [editCoordinates, setEditCoordinates] = useState<{
    x: string;
    y: string;
  }>({ x: "", y: "" });

  const handleEditPort = (marker: PortMarker) => {
    setEditingPortId(marker.id);
    setEditCoordinates({
      x: marker.position.x.toFixed(4),
      y: marker.position.y.toFixed(4)
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
        onUpdatePortMarkerCoordinates(editingPortId, {
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

  const isPortInBoundary = () => {
    if (!selectedBoundary || !editCoordinates.x || !editCoordinates.y)
      return false;

    const x = parseFloat(editCoordinates.x);
    const y = parseFloat(editCoordinates.y);

    if (isNaN(x) || isNaN(y)) return false;

    // Check if the boundary has at least 3 points (closed polygon)
    if (selectedBoundary.points.length < 3) return false;

    // Check if the point is inside the boundary
    return isPointInPolygon({ x, y }, selectedBoundary.points);
  };

  const isSaveDisabled = () => {
    return !isPortInBoundary();
  };
  if (!selectedBoundary) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center text-neutral-400 dark:text-neutral-500 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
            <Info className="w-8 h-8" />
          </div>
          <span className="mb-2 block font-medium">No boundary selected</span>
          <span className="text-sm">
            Select any boundary on the map to see more info.
          </span>
        </div>
      </div>
    );
  }

  const boundaryPorts = portMarkers.filter(
    (marker) => marker.boundaryId === selectedBoundary.id
  );
  const boundaryHasPorts = hasBoundaryPorts(selectedBoundary.id, portMarkers);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
          {selectedBoundary.name}
        </h3>
        <button
          className="hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded h-8 text-red-600 hover:text-red-700 transition-colors"
          title="Delete boundary"
          onClick={() => onDeleteBoundary(selectedBoundary.id)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
          <p className=" text-neutral-600 dark:text-neutral-400 text-sm">
            Type:{" "}
            <span className="capitalize font-medium">
              {getBoundaryTypeLabel(selectedBoundary.type, boundaryHasPorts)}
            </span>
          </p>
        </div>

        <div>
          <div className="mb-2 font-semibold text-neutral-700 dark:text-neutral-300 text-sm">
            Boundary Points:
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg max-h-32 overflow-y-auto">
            <ul className="text-neutral-700 dark:text-neutral-300 text-xs space-y-1">
              {selectedBoundary.points.map((pt, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800/90 text-white text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span>Point {idx + 1}:</span>
                  </div>
                  <span>
                    X: {pt.x.toFixed(4)}, Y: {pt.y.toFixed(4)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Port markers in this boundary */}
        <div>
          <div className="mb-2 font-semibold text-neutral-700 dark:text-neutral-300 text-sm">
            Ports in this room:
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
            {boundaryPorts.length > 0 ? (
              <ul className="text-neutral-700 dark:text-neutral-300 text-xs space-y-2">
                {boundaryPorts.map((marker) => (
                  <li
                    key={marker.id}
                    className="flex justify-between items-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800 p-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-sm flex-1 pl-1">
                        <div className="space-y-3">
                          {/* Port and Boundary Info with Action Buttons */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-start  w-full gap-2">
                                <div
                                  className={`w-8 h-8 flex items-center justify-center text-white text-sm font-bold rounded-full border border-white dark:border-neutral-700 shadow-sm ${getPortStatusColorClass(
                                    marker.status
                                  )}`}
                                >
                                  {marker.port.portNumber}
                                </div>

                                <div className="flex justify-between items-center flex-1">
                                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                    {getPortDisplayName(marker.port)}
                                  </div>

                                  {editingPortId === marker.id ? (
                                    <div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSaveEdit}
                                        disabled={isSaveDisabled()}
                                        className="h-7 w-7 p-0 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelEdit}
                                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditPort(marker)}
                                        className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          onDeletePortMarker(marker.id)
                                        }
                                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                Bank {marker.port.bankNumber} | Port #
                                {marker.port.portNumber}
                              </div>
                              {editingPortId !== marker.id && (
                                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                  X: {marker.position.x.toFixed(4)}, Y:{" "}
                                  {marker.position.y.toFixed(4)}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 ml-2"></div>
                          </div>

                          {/* Coordinate Input Fields - Only in Edit Mode */}
                          {editingPortId === marker.id && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="px-2 text-xs text-neutral-600 dark:text-neutral-400 mb-1 block">
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
                                <label className="px-2 text-xs text-neutral-600 dark:text-neutral-400 mb-1 block">
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
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-xs">
                No ports placed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
