import { Port } from "@/types/common/ports";
import L from "leaflet";
import { Boundary, BoundaryPoint, Coordinate, MapBounds } from "../types";

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
