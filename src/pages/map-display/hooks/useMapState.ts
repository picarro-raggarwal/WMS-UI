import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { Boundary } from "../data/mock-data";
import { PortMarker, PreviewPortMarker } from "../types";

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

  // Multiple pending port placements state
  const [pendingPortPlacements, setPendingPortPlacements] = useState<
    PreviewPortMarker[]
  >([]);

  // Helper functions for managing pending ports
  const addPendingPort = (
    port: any,
    coordinates: { x: number; y: number },
    boundaryId: string,
    boundaryName: string
  ): void => {
    // Use functional update to ensure we have the latest state
    setPendingPortPlacements((prevPendingPorts) => {
      // Check if this port is already placed or pending
      const isAlreadyPlaced = portMarkers.some(
        (marker) => marker.port.id === port.id
      );
      const isAlreadyPending = prevPendingPorts.some(
        (marker) => marker.port.id === port.id
      );

      if (isAlreadyPlaced || isAlreadyPending) {
        console.log(`Port ${port.id} already exists - not adding duplicate`);
        return prevPendingPorts; // Return current state without changes
      }

      const newPreviewMarker: PreviewPortMarker = {
        id: `preview-${Date.now()}-${Math.random()}`,
        port,
        coordinates,
        boundaryId,
        boundaryName
      };

      console.log(`Adding new port ${port.id} to pending list`);
      return [newPreviewMarker, ...prevPendingPorts];
    });

    // Note: Duplicate checking is handled in the state update
  };

  const removePendingPort = (id: string) => {
    setPendingPortPlacements((prev) => {
      return prev.filter((marker) => marker.id !== id);
    });
  };

  const clearPendingPorts = () => {
    setPendingPortPlacements([]);
  };

  const updatePendingPortCoordinates = (
    id: string,
    newCoordinates: { x: number; y: number }
  ) => {
    setPendingPortPlacements((prev) => {
      return prev.map((marker) =>
        marker.id === id ? { ...marker, coordinates: newCoordinates } : marker
      );
    });
  };

  // Clean up any duplicates that might have slipped through
  useEffect(() => {
    setPendingPortPlacements((prev) => {
      const uniquePorts = new Map();
      const cleaned = prev.filter((marker) => {
        if (uniquePorts.has(marker.port.id)) {
          console.log(`Removing duplicate port ${marker.port.id}`);
          return false;
        }
        uniquePorts.set(marker.port.id, true);
        return true;
      });

      // Only update if there were changes
      if (cleaned.length !== prev.length) {
        return cleaned;
      }

      return prev; // No changes needed
    });
  }, [portMarkers]); // Run when portMarkers change

  return {
    portMarkers,
    setPortMarkers,
    isAddingPort,
    setIsAddingPort,
    selectedPort,
    setSelectedPort,
    pendingPortPlacements,
    addPendingPort,
    removePendingPort,
    clearPendingPorts,
    updatePendingPortCoordinates
  };
};
