import { getPortDisplayName } from "@/types/common/ports";
import { Info, Trash2 } from "lucide-react";
import { Boundary, PortMarker } from "../types";

interface BoundaryDetailsProps {
  selectedBoundary: Boundary | null;
  portMarkers: PortMarker[];
  onDeleteBoundary: (id: string) => void;
  onDeletePortMarker: (markerId: string) => void;
}

export const BoundaryDetails = ({
  selectedBoundary,
  portMarkers,
  onDeleteBoundary,
  onDeletePortMarker
}: BoundaryDetailsProps) => {
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

  return (
    <div className="p-6">
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
          <p className="mb-2 text-neutral-600 dark:text-neutral-400 text-sm">
            Type:{" "}
            <span className="capitalize font-medium">
              {selectedBoundary.type}
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
                <li key={idx} className="flex justify-between">
                  <span>Point {idx + 1}:</span>
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
                    className="flex justify-between items-center"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {getPortDisplayName(marker.port)}
                      </span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        Bank {marker.port.bankNumber} | Port #
                        {marker.port.portNumber}
                      </span>
                    </div>
                    <button
                      className="text-red-600 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onClick={() => onDeletePortMarker(marker.id)}
                    >
                      Delete
                    </button>
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
