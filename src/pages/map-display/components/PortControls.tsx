import { Button } from "@/components/ui/button";
import { Port, getPortDisplayName } from "@/types/common/ports";
import { PendingPortPlacement } from "../types";
import { PortSelectionComponent } from "./PortSelection";

interface PortControlsProps {
  isAddingPort: boolean;
  availablePorts: Port[];
  selectedPort: Port | null;
  pendingPortPlacement: PendingPortPlacement | null;
  onPortSelect: (port: Port) => void;
  onSavePortPlacement: () => void;
  onCancelAddPort: () => void;
}

export const PortControls = ({
  isAddingPort,
  availablePorts,
  selectedPort,
  pendingPortPlacement,
  onPortSelect,
  onSavePortPlacement,
  onCancelAddPort
}: PortControlsProps) => {
  if (!isAddingPort) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <PortSelectionComponent
          availablePorts={availablePorts}
          selectedPort={selectedPort}
          onPortSelect={onPortSelect}
        />
      </div>

      {/* Pending port placement confirmation */}
      {pendingPortPlacement && (
        <div className="bg-white dark:bg-neutral-800 p-4 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-sm">
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <div>
              <span className="font-medium">Port:</span>{" "}
              {getPortDisplayName(pendingPortPlacement.port)}
            </div>
            <div>
              <span className="font-medium">Boundary:</span>{" "}
              {pendingPortPlacement.boundary.name}
            </div>
            <div>
              <span className="font-medium">Coordinates:</span> X:{" "}
              {pendingPortPlacement.coordinates.x.toFixed(4)}, Y:{" "}
              {pendingPortPlacement.coordinates.y.toFixed(4)}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">
              💡 Review the placement details and confirm
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 w-full">
        {pendingPortPlacement && (
          <Button
            variant="primary"
            onClick={onSavePortPlacement}
            className="flex-1"
          >
            Save Port
          </Button>
        )}
        <Button variant="outline" onClick={onCancelAddPort} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};
