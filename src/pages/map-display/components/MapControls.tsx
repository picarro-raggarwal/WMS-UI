import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

interface MapControlsProps {
  showMarkers: boolean;
  onShowMarkersChange: (checked: boolean) => void;
  onAddBoundary: () => void;
}

export const MapControls = ({
  showMarkers,
  onShowMarkersChange,
  onAddBoundary
}: MapControlsProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-markers"
          checked={showMarkers}
          onCheckedChange={onShowMarkersChange}
        />
        <div className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
          Show Markers
        </div>
      </div>

      <Button onClick={onAddBoundary} size="sm" variant="primary">
        <Plus className="w-4 h-4" />
        <span>Add Boundary</span>
      </Button>
    </div>
  );
};
