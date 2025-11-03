import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";

interface MapControlsProps {
  isDrawing: boolean;
  isAddingPort: boolean;
  drawingPoints: L.LatLngTuple[];
  onAddBoundary: () => void;
  onCancelDrawing: () => void;
  onAddPortMode: () => void;
  onCancelAddPort: () => void;
}

export const MapControls = ({
  isDrawing,
  isAddingPort,
  drawingPoints,
  onAddBoundary,
  onCancelDrawing,
  onAddPortMode,
  onCancelAddPort
}: MapControlsProps) => {
  return (
    <div className="space-y-3">
      {/* Add Boundary Button - Hidden when adding port */}
      {!isAddingPort && (
        <Button
          variant={isDrawing ? "default" : "outline"}
          onClick={onAddBoundary}
          disabled={isDrawing}
          className="w-full h-12 text-sm font-medium  hover:shadow-md"
        >
          {isDrawing ? (
            <div className="flex items-center gap-2">
              <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
              <span>Drawing Boundary...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              <span>Draw Boundary</span>
            </div>
          )}
        </Button>
      )}

      {/* Add Port Button - Hidden when drawing boundary */}
      {!isDrawing && (
        <Button
          variant={isAddingPort ? "default" : "outline"}
          onClick={onAddPortMode}
          disabled={isAddingPort}
          className="w-full h-12 text-sm font-medium  hover:shadow-md"
        >
          {isAddingPort ? (
            <div className="flex items-center gap-2">
              <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
              <span>Adding Port...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Port</span>
            </div>
          )}
        </Button>
      )}
    </div>
  );
};
