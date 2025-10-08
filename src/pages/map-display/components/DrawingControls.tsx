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
    <div className="space-y-3 w-full">
      <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
        <div className="space-y-2 text-gray-700 text-sm">
          <div>
            <span className="font-medium">Status:</span>{" "}
            {drawingPoints.length < 3
              ? `Add ${3 - drawingPoints.length} more points`
              : "Ready to save"}
          </div>
          <div>
            <span className="font-medium">Points:</span> {drawingPoints.length}{" "}
            / 3 minimum
          </div>
          <div className="text-gray-600 text-xs">
            Click on the map to add points for your boundary
          </div>
        </div>
      </div>

      {/* Show confirmation card when ready to save */}
      {drawingPoints.length >= 3 && (
        <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
          <div className="space-y-3 text-gray-700 text-sm">
            <div>
              <label className="block mb-1 font-medium text-gray-800 text-sm">
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

            <div>
              <span className="font-medium">Type:</span> Will be randomly
              assigned (Safe, Warning, or Danger)
            </div>

            <div>
              <span className="font-medium">Coordinates:</span>
              <div className="bg-gray-100 mt-1 p-2 rounded max-h-20 overflow-y-auto text-xs">
                {drawingPoints.map((point, idx) => (
                  <div key={idx}>
                    Point {idx + 1}: X: {point[1].toFixed(4)}, Y:{" "}
                    {point[0].toFixed(4)}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-gray-600 text-xs">
              💡 Review the boundary details and confirm
            </div>
          </div>

          {/* Action buttons at the bottom */}
          <div className="flex gap-2 mt-4 w-full">
            <Button
              variant="primary"
              onClick={onConfirmBoundarySave}
              className="flex-1"
            >
              Save Boundary
            </Button>
            <Button
              variant="outline"
              onClick={onCancelDrawing}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Cancel button when not ready to save */}
      {drawingPoints.length < 3 && (
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            onClick={onCancelDrawing}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
