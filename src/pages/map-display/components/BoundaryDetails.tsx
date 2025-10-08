import { getPortDisplayName } from "@/types/common/ports";
import { Trash2 } from "lucide-react";
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
      <div className="flex flex-col flex-1 justify-center items-center text-neutral-400">
        <span className="mb-2">No boundary selected</span>
        <span className="text-xs">
          Select any boundary on the map to see more info.
        </span>
      </div>
    );
  }

  const boundaryPorts = portMarkers.filter(
    (marker) => marker.boundaryId === selectedBoundary.id
  );

  return (
    <div className="flex-1 mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{selectedBoundary.name}</h3>
        <button
          className="hover:bg-red-50 p-2 rounded h-8 text-red-600 hover:text-red-700"
          title="Delete boundary"
          onClick={() => onDeleteBoundary(selectedBoundary.id)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <p className="mb-2 text-neutral-600 text-sm">
        Type: <span className="capitalize">{selectedBoundary.type}</span>
      </p>

      <div className="mb-2 font-semibold text-neutral-500 text-xs">
        Boundary Points:
      </div>
      <ul className="mb-4 text-neutral-700 text-xs">
        {selectedBoundary.points.map((pt, idx) => (
          <li key={idx}>
            X: {pt.x.toFixed(4)}, Y: {pt.y.toFixed(4)}
          </li>
        ))}
      </ul>

      {/* Port markers in this boundary */}
      <div className="mb-2 font-semibold text-neutral-500 text-xs">
        Ports in this room:
      </div>
      <ul className="mb-4 text-neutral-700 text-xs">
        {boundaryPorts.map((marker) => (
          <li key={marker.id} className="flex justify-between items-center">
            <span>{getPortDisplayName(marker.port)}</span>
            <button
              className="text-red-600 hover:text-red-700 text-xs"
              onClick={() => onDeletePortMarker(marker.id)}
            >
              Delete
            </button>
          </li>
        ))}
        {boundaryPorts.length === 0 && (
          <li className="text-gray-500 italic">No ports placed</li>
        )}
      </ul>
    </div>
  );
};
