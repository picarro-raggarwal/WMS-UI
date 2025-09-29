import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Boundary } from "../data/mock-data";

interface BoundaryDetailsProps {
  boundary: Boundary;
  showMarkers: boolean;
  movingMarkers: Array<{
    id: string;
    x: number;
    y: number;
    deviceType: string;
  }>;
  onEdit: (boundary: Boundary) => void;
  onDelete: (id: string) => void;
}

export const BoundaryDetails = ({
  boundary,
  showMarkers,
  movingMarkers,
  onEdit,
  onDelete
}: BoundaryDetailsProps) => {
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
          {boundary.name}
        </h3>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            className="p-2 h-8"
            title="Edit boundary"
            onClick={() => onEdit(boundary)}
          >
            <Edit className="w-5 h-5 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            className="p-2 h-8"
            title="Delete boundary"
            onClick={() => onDelete(boundary.id)}
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </Button>
        </div>
      </div>
      <p className="mb-3 text-neutral-600 dark:text-neutral-400 text-sm">
        Type: <span className="capitalize">{boundary.type}</span>
      </p>
      <div className="mb-2 font-semibold text-neutral-500 dark:text-neutral-400 text-xs">
        Boundary Points:
      </div>
      <ul className="mb-4 text-neutral-700 dark:text-neutral-300 text-xs space-y-1">
        {boundary.points.map((pt, idx) => (
          <li key={idx}>
            X: {pt.x.toFixed(4)}, Y: {pt.y.toFixed(4)}
          </li>
        ))}
      </ul>
      {showMarkers && (
        <>
          <div className="mb-2 font-semibold text-neutral-500 dark:text-neutral-400 text-xs">
            Markers:
          </div>
          <ul className="mb-4 text-neutral-700 dark:text-neutral-300 text-xs space-y-1">
            {movingMarkers.map((marker, idx) => (
              <li key={marker.id}>
                <span className="font-mono">Tag #{idx + 1}</span>
                {` (Device: ${marker.deviceType})`}: X: {marker.x.toFixed(4)},
                Y: {marker.y.toFixed(4)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
