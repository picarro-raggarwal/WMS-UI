import { Button } from "@/components/ui/button";

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
    <div className="flex gap-2 w-full">
      {/* Add Boundary Button */}
      <Button
        variant="outline"
        onClick={onAddBoundary}
        disabled={isDrawing || isAddingPort}
        className="flex-1"
      >
        {isDrawing ? (
          <>
            <div className="border-2 border-white border-t-transparent rounded-full w-3 h-3 animate-spin"></div>
            Drawing...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Draw Boundary
          </>
        )}
      </Button>

      {/* Add Port Button */}
      <Button
        variant="outline"
        onClick={onAddPortMode}
        disabled={isDrawing || isAddingPort}
        className="flex-1"
      >
        {isAddingPort ? (
          <>
            <div className="border-2 border-white border-t-transparent rounded-full w-3 h-3 animate-spin"></div>
            Adding Port...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Port
          </>
        )}
      </Button>
    </div>
  );
};
