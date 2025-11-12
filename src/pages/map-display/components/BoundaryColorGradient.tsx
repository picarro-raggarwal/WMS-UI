import L from "leaflet";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { Boundary, PortMarker } from "../types";
import {
  calculateIDWColor,
  getValidPoints,
  isPointInPolygon
} from "../utils/mapUtils";

interface BoundaryColorGradientProps {
  boundary: Boundary;
  portMarkers: PortMarker[];
  bounds: L.LatLngBoundsExpression;
  resolution?: number; // Pixels per unit (lower = higher quality but slower)
  onCalculatingChange?: (isCalculating: boolean) => void;
}

export const BoundaryColorGradient = memo(
  ({
    boundary,
    portMarkers,
    bounds,
    resolution = 2, // Default: 2 pixels per unit
    onCalculatingChange
  }: BoundaryColorGradientProps) => {
    const map = useMap();
    const overlayRef = useRef<L.ImageOverlay | null>(null);
    const cachedDataUrlRef = useRef<string | null>(null);
    const cacheKeyRef = useRef<string>("");
    const prevPortsKeyRef = useRef<string>("");
    const isCalculatingRef = useRef<boolean>(false);

    // Create a stable ports key for this boundary - only changes when ports for THIS boundary change
    const boundaryPortsKey = useMemo(() => {
      const ports = portMarkers.filter(
        (m) => m.boundaryId === boundary.id && m.status !== undefined
      );
      // Create a stable string key that only changes when ports for this boundary change
      const key = ports
        .sort((a, b) => a.id.localeCompare(b.id)) // Sort for consistent ordering
        .map(
          (m) =>
            `${m.id}-${m.position.x.toFixed(2)}-${m.position.y.toFixed(2)}-${
              m.status
            }`
        )
        .join("|");

      // Only update ref if key actually changed
      if (key !== prevPortsKeyRef.current) {
        prevPortsKeyRef.current = key;
      }

      return key;
    }, [boundary.id, portMarkers]);

    // Filter ports for this boundary only - only recalculate if the key actually changed
    const boundaryPortsOnly = useMemo(() => {
      // If key hasn't changed, return cached ports (but we need to recalculate from portMarkers)
      // Actually, we need to filter from current portMarkers to get latest data
      return portMarkers.filter(
        (m) => m.boundaryId === boundary.id && m.status !== undefined
      );
    }, [boundary.id, boundaryPortsKey]); // Depend on the key - will only change when this boundary's ports change

    // Create a cache key based on boundary and port data
    const cacheKey = useMemo(() => {
      const boundaryPointsKey = boundary.points
        .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
        .join(";");
      const boundaryKey = `${boundary.id}-${boundaryPointsKey}`;
      return `${boundaryKey}-${boundaryPortsKey}-${resolution}`;
    }, [boundary.id, boundary.points, boundaryPortsKey, resolution]);

    // State for gradient data (calculated asynchronously)
    const [gradientData, setGradientData] = useState<{
      dataUrl: string;
      overlayBounds: L.LatLngBoundsExpression;
    } | null>(null);

    // Calculate gradient asynchronously to avoid blocking UI
    useEffect(() => {
      // Notify that calculation is starting immediately
      if (onCalculatingChange && !isCalculatingRef.current) {
        isCalculatingRef.current = true;
        // Use setTimeout to ensure state update happens in next tick
        setTimeout(() => {
          onCalculatingChange(true);
        }, 0);
      }

      // Get valid boundary points first
      const validPoints = getValidPoints(boundary.points);
      if (validPoints.length < 3) {
        setGradientData(null);
        if (onCalculatingChange && isCalculatingRef.current) {
          isCalculatingRef.current = false;
          onCalculatingChange(false);
        }
        return;
      }

      // Use the filtered boundary ports and validate they're actually inside
      const boundaryPorts = boundaryPortsOnly.filter((marker) => {
        // Validate port is actually inside the boundary polygon
        return isPointInPolygon(marker.position, validPoints);
      });

      // Don't render if no ports with status
      if (boundaryPorts.length === 0) {
        setGradientData(null);
        if (onCalculatingChange && isCalculatingRef.current) {
          isCalculatingRef.current = false;
          onCalculatingChange(false);
        }
        return;
      }

      // Calculate boundary bounding box
      const xs = validPoints.map((p) => p.x);
      const ys = validPoints.map((p) => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      // Calculate boundary size
      const boundaryWidth = maxX - minX;
      const boundaryHeight = maxY - minY;
      const boundaryArea = boundaryWidth * boundaryHeight;

      // Adaptive resolution: use lower resolution for larger boundaries
      // Target: keep total pixels under 200k for performance
      let adaptiveResolution = resolution;
      const maxPixels = 200000; // Target max pixels
      const currentPixels = boundaryArea * (resolution * resolution);

      if (currentPixels > maxPixels) {
        // Calculate resolution that keeps us under max pixels
        adaptiveResolution = Math.sqrt(maxPixels / boundaryArea);
      }

      // Calculate canvas dimensions with adaptive resolution
      const width = Math.ceil(boundaryWidth * adaptiveResolution);
      const height = Math.ceil(boundaryHeight * adaptiveResolution);

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setGradientData(null);
        if (onCalculatingChange && isCalculatingRef.current) {
          isCalculatingRef.current = false;
          onCalculatingChange(false);
        }
        return;
      }

      // Create a temporary canvas for the gradient
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) {
        setGradientData(null);
        if (onCalculatingChange && isCalculatingRef.current) {
          isCalculatingRef.current = false;
          onCalculatingChange(false);
        }
        return;
      }

      // Create mask first to optimize point-in-polygon checks
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;
      const maskCtx = maskCanvas.getContext("2d");

      if (!maskCtx) {
        setGradientData(null);
        if (onCalculatingChange && isCalculatingRef.current) {
          isCalculatingRef.current = false;
          onCalculatingChange(false);
        }
        return;
      }

      // Draw the polygon as a white filled shape on the mask
      maskCtx.fillStyle = "white";
      maskCtx.beginPath();
      const firstPoint = validPoints[0];
      const firstX = (firstPoint.x - minX) * adaptiveResolution;
      const firstY = (maxY - firstPoint.y) * adaptiveResolution; // Flip Y coordinate
      maskCtx.moveTo(firstX, firstY);

      for (let i = 1; i < validPoints.length; i++) {
        const point = validPoints[i];
        const x = (point.x - minX) * adaptiveResolution;
        const y = (maxY - point.y) * adaptiveResolution; // Flip Y coordinate
        maskCtx.lineTo(x, y);
      }
      maskCtx.closePath();
      maskCtx.fill();

      // Get mask image data to check which pixels are inside
      const maskData = maskCtx.getImageData(0, 0, width, height);

      // Create image data for pixel manipulation on temporary canvas
      const imageData = tempCtx.createImageData(width, height);
      const data = imageData.data;

      // Process pixels in chunks to avoid blocking UI
      // Increase chunk size for better performance (larger chunks = fewer async breaks)
      const CHUNK_SIZE = 5000; // Process 5000 pixels per chunk
      let currentY = 0;
      let currentX = 0;
      let isCancelled = false;
      let totalPixelsProcessed = 0;
      let chunkCount = 0;

      const processChunk = () => {
        if (isCancelled) {
          return;
        }

        chunkCount++;
        let pixelsProcessed = 0;

        // Process pixels in chunks
        while (currentY < height && pixelsProcessed < CHUNK_SIZE) {
          const pixelIndex = (currentY * width + currentX) * 4;

          // Check mask to see if pixel is inside polygon
          if (maskData.data[pixelIndex + 3] > 0) {
            // Convert pixel coordinates to map coordinates
            const mapX = minX + currentX / adaptiveResolution;
            const mapY = maxY - currentY / adaptiveResolution; // Flip Y coordinate

            const point = { x: mapX, y: mapY };

            // Calculate IDW color at this point (with core radius for solid color around ports)
            const color = calculateIDWColor(point, boundaryPorts, 2, 20);
            const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);

            if (rgb) {
              data[pixelIndex] = parseInt(rgb[1], 16); // R
              data[pixelIndex + 1] = parseInt(rgb[2], 16); // G
              data[pixelIndex + 2] = parseInt(rgb[3], 16); // B
              data[pixelIndex + 3] = 180; // Alpha (semi-transparent)
            }
          }

          pixelsProcessed++;
          totalPixelsProcessed++;
          currentX++;
          if (currentX >= width) {
            currentX = 0;
            currentY++;
          }
        }

        // Check if we're done or need to continue
        if (currentY >= height) {
          // All pixels processed - finish up
          tempCtx.putImageData(imageData, 0, 0);

          // Draw the gradient to the main canvas
          ctx.drawImage(tempCanvas, 0, 0);

          // Apply the mask using destination-in composite operation
          ctx.globalCompositeOperation = "destination-in";
          ctx.drawImage(maskCanvas, 0, 0);
          ctx.globalCompositeOperation = "source-over"; // Reset to default

          // Convert canvas to data URL
          const dataUrl = canvas.toDataURL("image/png");

          // Create image overlay bounds
          const overlayBounds: L.LatLngBoundsExpression = [
            [minY, minX],
            [maxY, maxX]
          ];

          const gradientResult = { dataUrl, overlayBounds };
          setGradientData(gradientResult);

          // Don't notify completion here - wait until overlay is actually added
          // The overlay useEffect will handle the completion notification
        } else {
          // Continue processing in next frame
          // Use requestIdleCallback if available, otherwise setTimeout
          if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(processChunk, { timeout: 16 });
          } else {
            setTimeout(processChunk, 0);
          }
        }
      };

      // Start processing
      processChunk();

      // Cleanup function
      return () => {
        isCancelled = true;
        // Reset calculation state on cleanup
        if (onCalculatingChange && isCalculatingRef.current) {
          isCalculatingRef.current = false;
          onCalculatingChange(false);
        }
      };
    }, [
      cacheKey,
      boundaryPortsOnly,
      resolution,
      onCalculatingChange,
      boundary.id
    ]);

    useEffect(() => {
      // Skip if cache key hasn't changed - this prevents recalculation when other boundaries' ports change
      // This is the key optimization: only update when THIS boundary's ports actually change
      if (
        cacheKey === cacheKeyRef.current &&
        cachedDataUrlRef.current &&
        overlayRef.current
      ) {
        // Cache key is the same, no need to update - gradient stays as is
        // Don't clear loading state here - it should already be cleared
        return;
      }

      // Only proceed if we have gradient data ready
      if (!gradientData) {
        // Calculation is still in progress - don't clear loading state yet
        return;
      }

      // Cache key changed and we have gradient data - add overlay
      const { dataUrl, overlayBounds } = gradientData;

      // Remove existing overlay if any
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
      }

      // Create new image overlay
      const overlay = L.imageOverlay(dataUrl, overlayBounds, {
        opacity: 0.6,
        interactive: false,
        className: "boundary-color-gradient"
      });

      overlay.addTo(map);
      overlayRef.current = overlay;

      // Update cache
      cachedDataUrlRef.current = dataUrl;
      cacheKeyRef.current = cacheKey;

      // Notify that calculation is complete NOW (after overlay is added)
      if (onCalculatingChange && isCalculatingRef.current) {
        isCalculatingRef.current = false;
        // Use setTimeout to ensure state update happens after render
        setTimeout(() => {
          onCalculatingChange(false);
        }, 0);
      }

      // Cleanup on unmount
      return () => {
        if (overlayRef.current) {
          map.removeLayer(overlayRef.current);
          overlayRef.current = null;
        }
      };
    }, [cacheKey, gradientData, map, boundary.id, onCalculatingChange]); // Depend on gradientData to trigger when calculation completes

    return null;
  },
  // Custom comparison: only re-render if boundary or its ports actually change
  (prevProps, nextProps) => {
    // If boundary ID changed, re-render
    if (prevProps.boundary.id !== nextProps.boundary.id) {
      return false; // Re-render
    }

    // Check if boundary points changed (compare as strings for efficiency)
    const prevPointsKey = prevProps.boundary.points
      .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(";");
    const nextPointsKey = nextProps.boundary.points
      .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(";");
    if (prevPointsKey !== nextPointsKey) {
      return false; // Re-render
    }

    // Check if ports for THIS boundary changed
    const prevBoundaryPorts = prevProps.portMarkers
      .filter(
        (m) => m.boundaryId === prevProps.boundary.id && m.status !== undefined
      )
      .map((m) => `${m.id}-${m.position.x}-${m.position.y}-${m.status}`)
      .sort()
      .join("|");

    const nextBoundaryPorts = nextProps.portMarkers
      .filter(
        (m) => m.boundaryId === nextProps.boundary.id && m.status !== undefined
      )
      .map((m) => `${m.id}-${m.position.x}-${m.position.y}-${m.status}`)
      .sort()
      .join("|");

    // If ports for this boundary changed, re-render
    if (prevBoundaryPorts !== nextBoundaryPorts) {
      return false; // Re-render
    }

    // If resolution changed, re-render
    if (prevProps.resolution !== nextProps.resolution) {
      return false; // Re-render
    }

    // Nothing relevant changed, skip re-render
    return true; // Don't re-render
  }
);
