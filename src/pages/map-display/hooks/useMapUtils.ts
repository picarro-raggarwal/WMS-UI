import { useCallback } from "react";

/**
 * Custom hook for map utility functions
 */
export const useMapUtils = () => {
  /**
   * Helper function to check if a point is inside a polygon using ray casting algorithm
   */
  const isPointInPolygon = useCallback(
    (point: { x: number; y: number }, polygon: { x: number; y: number }[]) => {
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
    },
    []
  );

  /**
   * Calculate center point of a polygon
   */
  const calculatePolygonCenter = useCallback(
    (points: { x: number; y: number }[]) => {
      const validPoints = points.filter(
        (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
      );

      if (validPoints.length < 3) return { x: 0, y: 0 };

      const centerX =
        validPoints.reduce((sum, p) => sum + p.x, 0) / validPoints.length;
      const centerY =
        validPoints.reduce((sum, p) => sum + p.y, 0) / validPoints.length;

      return { x: centerX, y: centerY };
    },
    []
  );

  /**
   * Validate coordinates
   */
  const validateCoordinates = useCallback((x: number, y: number) => {
    return !isNaN(x) && !isNaN(y) && x !== 0 && y !== 0;
  }, []);

  /**
   * Filter valid points from a polygon
   */
  const getValidPoints = useCallback(
    (points: { x: number; y: number }[]) => {
      return points.filter((p) => validateCoordinates(p.x, p.y));
    },
    [validateCoordinates]
  );

  return {
    isPointInPolygon,
    calculatePolygonCenter,
    validateCoordinates,
    getValidPoints
  };
};
