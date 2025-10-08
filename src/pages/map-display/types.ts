import { Port } from "@/types/common/ports";
import L from "leaflet";

// Core map types
export type BoundaryPoint = { x: number; y: number };

export type Boundary = {
  id: string;
  name: string;
  type: "safe" | "warning" | "danger";
  points: BoundaryPoint[];
  markers?: BoundaryPoint[];
};

// Port marker interface
export interface PortMarker {
  id: string;
  port: Port;
  boundaryId: string;
  position: { x: number; y: number };
}

// Component prop interfaces
export interface MapClickHandlerProps {
  isDrawing: boolean;
  isAddingPort: boolean;
  onClick: (e: L.LeafletMouseEvent) => void;
}

export interface BoundaryLabelProps {
  boundary: Boundary;
  portMarkers: PortMarker[];
  onClick: (boundary: Boundary) => void;
  isAddingPort?: boolean;
  isSelected?: boolean;
}

export interface PortMarkerComponentProps {
  marker: PortMarker;
}

export interface PortSelectionComponentProps {
  availablePorts: Port[];
  selectedPort: Port | null;
  onPortSelect: (port: Port) => void;
}

export interface ScaleIndicatorProps {
  containerSize: { width: number; height: number } | null;
  imgSize: { width: number; height: number } | null;
}

export interface MapControlsProps {
  isDrawing: boolean;
  drawingPoints: L.LatLngTuple[];
  onAddBoundary: () => void;
  onCancelDrawing: () => void;
  onSaveBoundary: () => void;
  onCancelBoundarySave: () => void;
  pendingBoundarySave: {
    points: L.LatLngTuple[];
    boundaryName: string;
  } | null;
  onBoundaryNameChange: (name: string) => void;
  onConfirmBoundarySave: () => void;
}

export interface BoundaryFormProps<T extends Partial<Boundary> | Boundary> {
  boundary: T;
  onBoundaryChange: (boundary: T) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditMode?: boolean;
}

export interface BoundaryDetailsProps {
  boundary: Boundary;
  portMarkers: PortMarker[];
  onDeleteBoundary: (id: string) => void;
  onDeletePortMarker: (markerId: string) => void;
  getPortDisplayName: (port: Port) => string;
}

export interface AnimatedMarkerProps {
  position: [number, number];
  id: string;
  deviceType: string;
}

// Utility types
export interface Coordinate {
  x: number;
  y: number;
}

export interface MapBounds {
  width: number;
  height: number;
}

export interface PendingBoundarySave {
  points: L.LatLngTuple[];
  boundaryName: string;
}

export interface PendingPortPlacement {
  port: Port;
  boundary: Boundary;
  coordinates: { x: number; y: number };
}
