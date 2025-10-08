import { Button } from "@/components/ui/button";
import { Port, getPortDisplayName } from "@/types/common/ports";
import { Plus, Trash2 } from "lucide-react";
import { PreviewPortMarker } from "../types";
import { PortSelectionComponent } from "./PortSelection";

interface PortControlsProps {
  isAddingPort: boolean;
  availablePorts: Port[];
  selectedPort: Port | null;
  pendingPortPlacements: PreviewPortMarker[];
  onPortSelect: (port: Port) => void;
  onSavePortPlacements: () => void;
  onRemovePendingPort: (id: string) => void;
  onCancelAddPort: () => void;
}

export const PortControls = ({
  isAddingPort,
  availablePorts,
  selectedPort,
  pendingPortPlacements,
  onPortSelect,
  onSavePortPlacements,
  onRemovePendingPort,
  onCancelAddPort
}: PortControlsProps) => {
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
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-600 dark:bg-neutral-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/90 text-xs font-bold text-white">
                    {previewMarker.port.portNumber}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {getPortDisplayName(previewMarker.port)}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      <div>{previewMarker.boundaryName}</div>
                      <div>
                        ({previewMarker.coordinates.x.toFixed(2)},{" "}
                        {previewMarker.coordinates.y.toFixed(2)})
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemovePendingPort(previewMarker.id)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
