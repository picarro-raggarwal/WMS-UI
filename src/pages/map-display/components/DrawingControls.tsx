import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PendingBoundarySave } from "../types";

interface DrawingControlsProps {
  isDrawing: boolean;
  drawingPoints: L.LatLngTuple[];
  pendingBoundarySave: PendingBoundarySave | null;
  onBoundaryNameChange: (name: string) => void;
  onConfirmBoundarySave: () => void;
  onCancelDrawing: () => void;
  boundariesCount: number;
}

export const DrawingControls = ({
  isDrawing,
  drawingPoints,
  pendingBoundarySave,
  onBoundaryNameChange,
  onConfirmBoundarySave,
  onCancelDrawing,
  boundariesCount
}: DrawingControlsProps) => {
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
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Type:
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Will be randomly assigned (Safe, Warning, or Danger)
                  </span>
                </div>

                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Coordinates:
                  </span>
                  <div className="bg-gray-50 dark:bg-neutral-700 mt-2 p-3 rounded max-h-24 overflow-y-auto text-xs">
                    {drawingPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Point {idx + 1}: X: {point[1].toFixed(4)}, Y:{" "}
                        {point[0].toFixed(4)}
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
