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
    <div className="space-y-3 w-full">
      <PortSelectionComponent
        availablePorts={availablePorts}
        selectedPort={selectedPort}
        onPortSelect={onPortSelect}
      />

      {/* Pending port placement confirmation */}
      {pendingPortPlacement && (
        <div className="space-y-3 w-full">
          <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
            <div className="space-y-2 text-gray-700 text-sm">
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
              <div className="text-gray-600 text-xs">
                💡 Review the placement details and confirm
              </div>
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
