import { useToast } from "@/hooks/use-toast";
import L from "leaflet";
import { useCallback } from "react";
import { Boundary } from "../data/mock-data";

/**
 * Custom hook for map interaction handlers
 */
export const useMapHandlers = (
  isDrawing: boolean,
  isAddingPort: boolean,
  selectedPort: any,
  boundaries: Boundary[],
  drawingPoints: L.LatLngTuple[],
  setDrawingPoints: (points: L.LatLngTuple[]) => void,
  setSelectedBoundary: (boundary: Boundary | null) => void,
  addPendingPort: (
    port: any,
    coordinates: { x: number; y: number },
    boundaryId: string,
    boundaryName: string
  ) => void,
  isPointInPolygon: (
    point: { x: number; y: number },
    polygon: { x: number; y: number }[]
  ) => boolean
) => {
  const { toast } = useToast();

  /**
   * Handle map clicks for drawing and port placement
   */
  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (isDrawing) {
        const lat = Math.max(0, e.latlng.lat);
        const lng = Math.max(0, e.latlng.lng);

        // Check if the click point is inside any existing boundary
        const clickPoint = { x: lng, y: lat };
        const isInsideExistingBoundary = boundaries.some((boundary) => {
          const validPoints = boundary.points.filter(
            (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
          );

          if (validPoints.length < 3) return false;

          // Simple point-in-polygon check
          return isPointInPolygon(clickPoint, validPoints);
        });

        // Only add point if it's not inside an existing boundary
        if (!isInsideExistingBoundary) {
          setDrawingPoints([...drawingPoints, [lat, lng]]);
        }
      } else if (isAddingPort && selectedPort) {
        // Handle port placement when clicking on the map
        const coordinates = {
          x: Math.max(0, e.latlng.lng),
          y: Math.max(0, e.latlng.lat)
        };

        // Find which boundary contains this click point
        const containingBoundary = boundaries.find((boundary) => {
          const validPoints = boundary.points.filter(
            (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
          );

          if (validPoints.length < 3) return false;

          return isPointInPolygon(coordinates, validPoints);
        });

        if (containingBoundary) {
          // Click is inside a boundary, try to add to pending ports
          addPendingPort(
            selectedPort,
            coordinates,
            containingBoundary.id,
            containingBoundary.name
          );
          // Note: Duplicate checking is now handled inside addPendingPort
        } else {
          // Click is outside all boundaries, reject port placement
          toast({
            title: "Port Placement Rejected",
            description: "Click location is not within any boundary",
            variant: "destructive"
          });
        }
      } else {
        // Clear selection when clicking on empty areas
        setSelectedBoundary(null);
      }
    },
    [
      isDrawing,
      isAddingPort,
      selectedPort,
      boundaries,
      drawingPoints,
      setDrawingPoints,
      setSelectedBoundary,
      addPendingPort,
      isPointInPolygon,
      toast
    ]
  );

  /**
   * Handle boundary clicks for selection and port placement
   */
  const handleBoundaryClick = useCallback(
    (boundary: Boundary) => {
      // Don't allow clicking on boundaries when drawing
      if (isDrawing) {
        return;
      }
      setSelectedBoundary(boundary);
    },
    [isDrawing, setSelectedBoundary]
  );

  /**
   * Handle boundary clicks for port placement
   */
  const handleBoundaryClickForPort = useCallback(
    (boundary: Boundary, clickEvent?: L.LeafletMouseEvent) => {
      // Don't allow clicking on boundaries when drawing
      if (isDrawing) {
        return;
      }

      if (isAddingPort && selectedPort) {
        // Use click coordinates if available, otherwise fall back to center
        let coordinates: { x: number; y: number };

        if (clickEvent) {
          // Use the exact click location
          coordinates = {
            x: Math.max(0, clickEvent.latlng.lng),
            y: Math.max(0, clickEvent.latlng.lat)
          };

          // Validate that the click is within the boundary using Leaflet's point-in-polygon check
          const validPoints = boundary.points.filter(
            (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
          );

          if (validPoints.length >= 3) {
            // Convert boundary points to Leaflet LatLng format [lat, lng] (which is [y, x] in our system)
            const polygonPoints = validPoints.map(
              (p) => [p.y, p.x] as L.LatLngTuple
            );

            // Create a Leaflet polygon for point-in-polygon testing
            const polygon = L.polygon(polygonPoints);

            // Check if the clicked point is inside the polygon using Leaflet's contains method
            const clickedLatLng = L.latLng(coordinates.y, coordinates.x);

            // Use Leaflet's polygon contains method for accurate point-in-polygon testing
            if (!polygon.getBounds().contains(clickedLatLng)) {
              // Quick bounds check first - if outside bounds, definitely outside polygon
              toast({
                title: "Port Placement Rejected",
                description: "Click location is outside the boundary bounds",
                variant: "destructive"
              });
              return;
            }

            // More precise check using ray casting algorithm
            const isInsidePolygon = (point: L.LatLng, polygon: L.LatLng[]) => {
              let inside = false;
              for (
                let i = 0, j = polygon.length - 1;
                i < polygon.length;
                j = i++
              ) {
                const xi = polygon[i].lat;
                const yi = polygon[i].lng;
                const xj = polygon[j].lat;
                const yj = polygon[j].lng;

                if (
                  yi > point.lng !== yj > point.lng &&
                  point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi
                ) {
                  inside = !inside;
                }
              }
              return inside;
            };

            const polygonLatLngs = polygon.getLatLngs()[0] as L.LatLng[];
            if (!isInsidePolygon(clickedLatLng, polygonLatLngs)) {
              toast({
                title: "Port Placement Rejected",
                description: "Click location is outside the boundary polygon",
                variant: "destructive"
              });
              return;
            }
          }
        } else {
          // Fallback to center calculation
          const validPoints = boundary.points.filter(
            (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
          );

          if (validPoints.length < 3) return;

          const centerX =
            validPoints.reduce((sum, p) => sum + p.x, 0) / validPoints.length;
          const centerY =
            validPoints.reduce((sum, p) => sum + p.y, 0) / validPoints.length;

          coordinates = { x: centerX, y: centerY };
        }

        // Show pending placement instead of immediately placing
        addPendingPort(selectedPort, coordinates, boundary.id, boundary.name);
        // Note: Duplicate checking is now handled inside addPendingPort
      } else {
        handleBoundaryClick(boundary);
      }
    },
    [
      isDrawing,
      isAddingPort,
      selectedPort,
      addPendingPort,
      handleBoundaryClick,
      toast
    ]
  );

  return {
    handleMapClick,
    handleBoundaryClick,
    handleBoundaryClickForPort
  };
};
