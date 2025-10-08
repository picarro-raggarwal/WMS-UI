import L from "leaflet";
import { useRef, useState } from "react";
import { Boundary } from "../data/mock-data";
import { PortMarker } from "../types";

/**
 * Custom hook for managing map-related state
 */
export const useMapState = () => {
  // Map container reference
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Image size state
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Container size state
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  return {
    mapContainerRef,
    imgSize,
    setImgSize,
    containerSize,
    setContainerSize
  };
};

/**
 * Custom hook for managing boundary-related state
 */
export const useBoundaryState = () => {
  // Boundary selection state
  const [selectedBoundary, setSelectedBoundary] = useState<Boundary | null>(
    null
  );

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<L.LatLngTuple[]>([]);

  // Boundary management state
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);

  // Pending boundary save state
  const [pendingBoundarySave, setPendingBoundarySave] = useState<{
    points: L.LatLngTuple[];
    boundaryName: string;
  } | null>(null);

  return {
    selectedBoundary,
    setSelectedBoundary,
    isDrawing,
    setIsDrawing,
    drawingPoints,
    setDrawingPoints,
    boundaries,
    setBoundaries,
    pendingBoundarySave,
    setPendingBoundarySave
  };
};

/**
 * Custom hook for managing port-related state
 */
export const usePortState = () => {
  // Port markers state
  const [portMarkers, setPortMarkers] = useState<PortMarker[]>([]);

  // Port addition state
  const [isAddingPort, setIsAddingPort] = useState(false);
  const [selectedPort, setSelectedPort] = useState<any>(null);

  // Pending port placement state
  const [pendingPortPlacement, setPendingPortPlacement] = useState<{
    port: any;
    boundary: Boundary;
    coordinates: { x: number; y: number };
  } | null>(null);

  return {
    portMarkers,
    setPortMarkers,
    isAddingPort,
    setIsAddingPort,
    selectedPort,
    setSelectedPort,
    pendingPortPlacement,
    setPendingPortPlacement
  };
};
