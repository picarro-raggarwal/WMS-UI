import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { Boundary, PendingBoundarySave } from "../types";
import { doPolygonsIntersect } from "../utils/mapUtils";

interface DrawingControlsProps {
  isDrawing: boolean;
  drawingPoints: L.LatLngTuple[];
  pendingBoundarySave: PendingBoundarySave | null;
  boundaries: Boundary[];
  onBoundaryNameChange: (name: string) => void;
  onConfirmBoundarySave: () => void;
  onCancelDrawing: () => void;
  onUpdateDrawingPoint: (index: number, coordinates: L.LatLngTuple) => void;
  boundariesCount: number;
}

export const DrawingControls = ({
  isDrawing,
  drawingPoints,
  pendingBoundarySave,
  boundaries,
  onBoundaryNameChange,
  onConfirmBoundarySave,
  onCancelDrawing,
  onUpdateDrawingPoint,
  boundariesCount
}: DrawingControlsProps) => {
  const [editingPointIndex, setEditingPointIndex] = useState<number | null>(
    null
  );
  const [editCoordinates, setEditCoordinates] = useState<{
    x: string;
    y: string;
  }>({ x: "", y: "" });

  const handleEditPoint = (index: number, point: L.LatLngTuple) => {
    setEditingPointIndex(index);
    setEditCoordinates({
      x: point[1].toFixed(4), // L.LatLngTuple is [lat, lng], so [1] is lng (x)
      y: point[0].toFixed(4) // and [0] is lat (y)
    });
  };

  const handleSaveEdit = () => {
    if (editingPointIndex !== null && editCoordinates.x && editCoordinates.y) {
      const x = parseFloat(editCoordinates.x);
      const y = parseFloat(editCoordinates.y);
      if (!isNaN(x) && !isNaN(y)) {
        // Round to 4 decimal places
        const roundedX = Math.round(x * 10000) / 10000;
        const roundedY = Math.round(y * 10000) / 10000;
        onUpdateDrawingPoint(editingPointIndex, [roundedY, roundedX]); // [lat, lng]
        setEditingPointIndex(null);
        setEditCoordinates({ x: "", y: "" });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPointIndex(null);
    setEditCoordinates({ x: "", y: "" });
  };

  // Check if the current drawing points overlap with existing boundaries
  const hasPolygonOverlap = () => {
    if (drawingPoints.length < 3) return false;

    // Convert drawing points to boundary format
    const currentPolygon = drawingPoints.map((point) => ({
      x: point[1], // longitude
      y: point[0] // latitude
    }));

    // Check against all existing boundaries
    return boundaries.some((boundary) => {
      if (boundary.points.length < 3) return false;
      return doPolygonsIntersect(currentPolygon, boundary.points);
    });
  };

  // Check if save button should be disabled
  const isSaveDisabled = () => {
    return editingPointIndex !== null || hasPolygonOverlap();
  };

  if (!isDrawing) return null;

  return (
    <div className="space-y-4">
      {/* Single Card View */}
      <div className="bg-white dark:bg-neutral-800 p-4 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-sm">
        {/* Header */}
        <div className="mb-4">
          {/* Status Section */}
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span
                className={
                  drawingPoints.length < 3
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-green-600 dark:text-green-400"
                }
              >
                {drawingPoints.length < 3
                  ? `Add ${3 - drawingPoints.length} more points`
                  : "Ready to save"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Points:</span>
              <span className="text-gray-600 dark:text-gray-400">
                {drawingPoints.length} / 3 minimum
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 Click on the map to add points for your boundary
            </div>
          </div>
        </div>

        {/* Confirmation Section - Show when ready */}
        {drawingPoints.length >= 3 && (
          <div className="border-t border-gray-200 dark:border-neutral-600 pt-4">
            <div className="space-y-3">
              {/* Boundary Name Input */}
              <div>
                <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200 text-sm">
                  Boundary Name *
                </label>
                <Input
                  type="text"
                  value={pendingBoundarySave?.boundaryName || ""}
                  onChange={(e) => onBoundaryNameChange(e.target.value)}
                  placeholder={`User Boundary ${boundariesCount + 1}`}
                  className="w-full"
                  required
                />
              </div>

              {/* Boundary Details */}
              <div className="space-y-2 text-sm">
                {/* <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Type:
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Will be randomly assigned (Safe, Warning, or Danger)
                  </span>
                </div> */}

                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Coordinates:
                  </span>
                  <div className="bg-gray-50 dark:bg-neutral-700 mt-2 p-3 rounded max-h-48 overflow-y-auto text-xs space-y-2">
                    {drawingPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800 p-2"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="text-sm flex-1 pl-1">
                            {editingPointIndex === idx ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800/90 text-white text-xs font-bold">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Editing Vertex {idx + 1}
                                  </span>
                                </div>
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
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    className="h-8 text-xs w-1/2"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="h-8 text-xs w-1/2"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800/90 text-white text-xs font-bold">
                                  {idx + 1}
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                  X: {point[1].toFixed(4)}, Y:{" "}
                                  {point[0].toFixed(4)}
                                </span>
                              </div>
                            )}
                          </div>
                          {editingPointIndex !== idx && (
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPoint(idx, point)}
                                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Review the boundary details and confirm
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 w-full">
          {drawingPoints.length >= 3 && (
            <Button
              variant="primary"
              onClick={onConfirmBoundarySave}
              disabled={isSaveDisabled()}
              className="flex-1"
            >
              Save Boundary
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onCancelDrawing}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
