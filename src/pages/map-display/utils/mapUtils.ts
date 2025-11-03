import { Port } from "@/types/common/ports";
import L from "leaflet";
import {
  Boundary,
  BoundaryPoint,
  Coordinate,
  MapBounds,
  PortMarker
} from "../types";

/**
 * Map utility functions for coordinate and boundary operations
 */

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export const isPointInPolygon = (
  point: Coordinate,
  polygon: BoundaryPoint[]
): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    if (
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
};

/**
 * Calculate center point of a polygon
 */
export const calculatePolygonCenter = (points: BoundaryPoint[]): Coordinate => {
  const validPoints = points.filter(
    (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
  );

  if (validPoints.length < 3) return { x: 0, y: 0 };

  const centerX =
    validPoints.reduce((sum, p) => sum + p.x, 0) / validPoints.length;
  const centerY =
    validPoints.reduce((sum, p) => sum + p.y, 0) / validPoints.length;

  return { x: centerX, y: centerY };
};

/**
 * Validate coordinates
 */
export const validateCoordinates = (x: number, y: number): boolean => {
  return !isNaN(x) && !isNaN(y) && x !== 0 && y !== 0;
};

/**
 * Filter valid points from a polygon
 */
export const getValidPoints = (points: BoundaryPoint[]): BoundaryPoint[] => {
  return points.filter((p) => validateCoordinates(p.x, p.y));
};

/**
 * Generate a random boundary type
 */
export const getRandomBoundaryType = (): "safe" | "warning" | "danger" => {
  const types: ("safe" | "warning" | "danger")[] = [
    "safe",
    "warning",
    "danger"
  ];
  return types[Math.floor(Math.random() * types.length)];
};

/**
 * Get available ports (not yet placed on map or pending)
 */
export const getAvailablePorts = (
  allPorts: Port[],
  portMarkers: { port: Port }[],
  pendingPortPlacements?: { port: Port }[]
): Port[] => {
  const usedPortIds = portMarkers.map((marker) => marker.port.id);
  const pendingPortIds =
    pendingPortPlacements?.map((marker) => marker.port.id) || [];
  const allUsedIds = [...usedPortIds, ...pendingPortIds];
  return allPorts.filter((port) => !allUsedIds.includes(port.id));
};

/**
 * Convert boundary points to Leaflet LatLng format
 */
export const convertToLeafletFormat = (
  points: BoundaryPoint[]
): L.LatLngTuple[] => {
  return points.map((p) => [p.y, p.x] as L.LatLngTuple);
};

/**
 * Create Leaflet polygon from boundary points
 */
export const createLeafletPolygon = (points: BoundaryPoint[]): L.Polygon => {
  const leafletPoints = convertToLeafletFormat(points);
  return L.polygon(leafletPoints);
};

/**
 * Check if coordinates are within polygon bounds
 */
export const isWithinPolygonBounds = (
  coordinates: Coordinate,
  polygon: L.Polygon
): boolean => {
  const clickedLatLng = L.latLng(coordinates.y, coordinates.x);
  return polygon.getBounds().contains(clickedLatLng);
};

/**
 * Perform precise point-in-polygon check using Leaflet
 */
export const isInsideLeafletPolygon = (
  point: Coordinate,
  polygon: L.Polygon
): boolean => {
  const clickedLatLng = L.latLng(point.y, point.x);
  const polygonLatLngs = polygon.getLatLngs()[0] as L.LatLng[];

  let inside = false;
  for (
    let i = 0, j = polygonLatLngs.length - 1;
    i < polygonLatLngs.length;
    j = i++
  ) {
    const xi = polygonLatLngs[i].lat;
    const yi = polygonLatLngs[i].lng;
    const xj = polygonLatLngs[j].lat;
    const yj = polygonLatLngs[j].lng;

    if (
      yi > clickedLatLng.lng !== yj > clickedLatLng.lng &&
      clickedLatLng.lat <
        ((xj - xi) * (clickedLatLng.lng - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
};

/**
 * Generate unique ID for boundaries
 */
export const generateBoundaryId = (): string => {
  return `boundary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for port markers
 */
export const generatePortMarkerId = (): string => {
  return `port-marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate map bounds from image size
 */
export const calculateMapBounds = (
  imgSize: MapBounds
): L.LatLngBoundsExpression => {
  return [
    [0, 0],
    [imgSize.height, imgSize.width]
  ];
};

/**
 * Format coordinate for display
 */
export const formatCoordinate = (
  value: number,
  decimals: number = 4
): string => {
  return value.toFixed(decimals);
};

/**
 * Parse coordinate from string
 */
export const parseCoordinate = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Check if boundary has minimum required points
 */
export const hasMinimumPoints = (points: BoundaryPoint[]): boolean => {
  return getValidPoints(points).length >= 3;
};

/**
 * Check if two polygons intersect
 */
export const doPolygonsIntersect = (
  polygon1: BoundaryPoint[],
  polygon2: BoundaryPoint[]
): boolean => {
  // Check if any vertex of polygon1 is inside polygon2
  for (const point of polygon1) {
    if (isPointInPolygon(point, polygon2)) {
      return true;
    }
  }

  // Check if any vertex of polygon2 is inside polygon1
  for (const point of polygon2) {
    if (isPointInPolygon(point, polygon1)) {
      return true;
    }
  }

  // Check if any edge of polygon1 intersects with any edge of polygon2
  for (let i = 0; i < polygon1.length; i++) {
    const p1 = polygon1[i];
    const p2 = polygon1[(i + 1) % polygon1.length];

    for (let j = 0; j < polygon2.length; j++) {
      const p3 = polygon2[j];
      const p4 = polygon2[(j + 1) % polygon2.length];

      if (doLinesIntersect(p1, p2, p3, p4)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check if two line segments intersect
 */
const doLinesIntersect = (
  p1: BoundaryPoint,
  p2: BoundaryPoint,
  p3: BoundaryPoint,
  p4: BoundaryPoint
): boolean => {
  const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

  if (Math.abs(denom) < 1e-10) {
    return false; // Lines are parallel
  }

  const ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
  const ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
};

/**
 * Find boundary containing a point
 */
export const findContainingBoundary = (
  point: Coordinate,
  boundaries: Boundary[]
): Boundary | undefined => {
  return boundaries.find((boundary) => {
    const validPoints = getValidPoints(boundary.points);
    if (validPoints.length < 3) return false;
    return isPointInPolygon(point, validPoints);
  });
};

/**
 * Get port status color class based on status value
 * 0 = green (normal), 1 = amber (warning), 2 = red (critical)
 */
export const getPortStatusColorClass = (status?: 0 | 1 | 2): string => {
  switch (status) {
    case 0:
      return "bg-green-500"; // green for normal/operational
    case 1:
      return "bg-yellow-500"; // amber
    case 2:
      return "bg-red-600"; // red/warning
    default:
      return "bg-slate-400"; // default gray
  }
};

/**
 * Get port status color (hex) for Leaflet markers
 * Returns hex values matching Tailwind classes for consistency
 * Use getPortStatusColorClass for React components with Tailwind classes
 */
export const getPortStatusColor = (status?: 0 | 1 | 2): string => {
  switch (status) {
    case 0:
      return "#22c55e"; // bg-green-500 (normal/operational)
    case 1:
      return "#F59E0B"; // bg-yellow-500
    case 2:
      return "#EF4444"; // bg-red-600
    default:
      return "#94A3B8"; // bg-slate-400
  }
};

/**
 * Calculate boundary type based on port statuses
 * If any port has status 2, boundary type is 2 (danger)
 * If max status is 1, boundary type is 1 (warning)
 * Otherwise, boundary type is 0 (safe)
 */
export const calculateBoundaryType = (
  boundaryId: string,
  portMarkers: PortMarker[]
): 0 | 1 | 2 => {
  const boundaryPorts = portMarkers.filter(
    (marker) => marker.boundaryId === boundaryId
  );

  if (boundaryPorts.length === 0) {
    return 0; // safe if no ports
  }

  const statuses = boundaryPorts
    .map((marker) => marker.status ?? 0)
    .filter((status): status is 0 | 1 | 2 => status !== undefined);

  if (statuses.length === 0) {
    return 0; // safe if no statuses
  }

  const maxStatus = Math.max(...statuses) as 0 | 1 | 2;

  // If any port has status 2, return 2 (danger)
  if (maxStatus >= 2) {
    return 2;
  }

  // If max status is 1, return 1 (warning)
  if (maxStatus >= 1) {
    return 1;
  }

  // Otherwise, return 0 (safe)
  return 0;
};

/**
 * Check if a boundary has any ports
 */
export const hasBoundaryPorts = (
  boundaryId: string,
  portMarkers: PortMarker[]
): boolean => {
  return portMarkers.some((marker) => marker.boundaryId === boundaryId);
};

/**
 * Get boundary type color class based on numeric type
 * If no ports, returns gray
 * 0 = green (safe), 1 = amber (warning), 2 = red (danger)
 */
// export const getBoundaryTypeColorClass = (
//   type: 0 | 1 | 2,
//   hasPorts: boolean = true
// ): string => {
//   if (!hasPorts) {
//     return "bg-slate-400"; // gray for no ports
//   }

//   switch (type) {
//     case 0:
//       return "bg-green-500"; // green
//     case 1:
//       return "bg-amber-500"; // amber
//     case 2:
//       return "bg-red-500"; // red
//     default:
//       return "bg-slate-400"; // default gray
//   }
// };

/**
 * Get boundary type color (hex) for Leaflet polygons
 * Returns hex values matching Tailwind classes for consistency
 * Use getBoundaryTypeColorClass for React components with Tailwind classes
 */
export const getBoundaryTypeColor = (
  type: 0 | 1 | 2,
  hasPorts: boolean = true
): string => {
  if (!hasPorts) {
    return "#94A3B8"; // bg-slate-400 (no ports)
  }

  switch (type) {
    case 0:
      return "#22c55e"; // bg-green-500 (normal/operational)
    case 1:
      return "#F59E0B"; // bg-yellow-500
    case 2:
      return "#EF4444"; // bg-red-600
    default:
      return "#94A3B8"; // bg-slate-400
  }
};

/**
 * Get boundary type label for display
 * 0 = "safe", 1 = "warning", 2 = "danger"
 * Returns "No Ports" if hasPorts is false
 */
export const getBoundaryTypeLabel = (
  type: 0 | 1 | 2,
  hasPorts: boolean = true
): string => {
  if (!hasPorts) {
    return "No Ports";
  }

  switch (type) {
    case 0:
      return "safe";
    case 1:
      return "warning";
    case 2:
      return "danger";
    default:
      return "safe";
  }
};
