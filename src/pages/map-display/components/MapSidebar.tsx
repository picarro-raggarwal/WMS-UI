import { Port } from "@/types/common/ports";
import {
  Boundary,
  PendingBoundarySave,
  PendingPortPlacement,
  PortMarker
} from "../types";
import { BoundaryDetails } from "./BoundaryDetails";
import { DrawingControls } from "./DrawingControls";
import { MapControls } from "./MapControls";
import { PortControls } from "./PortControls";

interface MapSidebarProps {
  // Drawing state
  isDrawing: boolean;
  isAddingPort: boolean;
  drawingPoints: L.LatLngTuple[];
  pendingBoundarySave: PendingBoundarySave | null;

  // Port state
  availablePorts: Port[];
  selectedPort: Port | null;
  pendingPortPlacement: PendingPortPlacement | null;

  // Boundary state
  selectedBoundary: Boundary | null;
  portMarkers: PortMarker[];
  boundariesCount: number;

  // Handlers
  onAddBoundary: () => void;
  onCancelDrawing: () => void;
  onAddPortMode: () => void;
  onCancelAddPort: () => void;
  onPortSelect: (port: Port) => void;
  onSavePortPlacement: () => void;
  onBoundaryNameChange: (name: string) => void;
  onConfirmBoundarySave: () => void;
  onDeleteBoundary: (id: string) => void;
  onDeletePortMarker: (markerId: string) => void;
}

export const MapSidebar = ({
  isDrawing,
  isAddingPort,
  drawingPoints,
  pendingBoundarySave,
  availablePorts,
  selectedPort,
  pendingPortPlacement,
  selectedBoundary,
  portMarkers,
  boundariesCount,
  onAddBoundary,
  onCancelDrawing,
  onAddPortMode,
  onCancelAddPort,
  onPortSelect,
  onSavePortPlacement,
  onBoundaryNameChange,
  onConfirmBoundarySave,
  onDeleteBoundary,
  onDeletePortMarker
}: MapSidebarProps) => {
  return (
    <aside className="flex flex-col flex-shrink-0 bg-neutral-50 dark:bg-neutral-900 shadow mt-8 md:mt-0 ml-0 md:ml-4 p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg w-full md:w-96 h-full overflow-y-auto">
      <div className="flex flex-col gap-2">
        <MapControls
          isDrawing={isDrawing}
          isAddingPort={isAddingPort}
          drawingPoints={drawingPoints}
          onAddBoundary={onAddBoundary}
          onCancelDrawing={onCancelDrawing}
          onAddPortMode={onAddPortMode}
          onCancelAddPort={onCancelAddPort}
        />

        <DrawingControls
          isDrawing={isDrawing}
          drawingPoints={drawingPoints}
          pendingBoundarySave={pendingBoundarySave}
          onBoundaryNameChange={onBoundaryNameChange}
          onConfirmBoundarySave={onConfirmBoundarySave}
          onCancelDrawing={onCancelDrawing}
          boundariesCount={boundariesCount}
        />

        <PortControls
          isAddingPort={isAddingPort}
          availablePorts={availablePorts}
          selectedPort={selectedPort}
          pendingPortPlacement={pendingPortPlacement}
          onPortSelect={onPortSelect}
          onSavePortPlacement={onSavePortPlacement}
          onCancelAddPort={onCancelAddPort}
        />
      </div>

      <BoundaryDetails
        selectedBoundary={selectedBoundary}
        portMarkers={portMarkers}
        onDeleteBoundary={onDeleteBoundary}
        onDeletePortMarker={onDeletePortMarker}
      />
    </aside>
  );
};
