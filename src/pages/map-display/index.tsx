import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import L from "leaflet";
import "leaflet-imageoverlay-rotated";
import "leaflet/dist/leaflet.css";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageOverlay, MapContainer, Polygon, useMap } from "react-leaflet";
import { AnimatedMarker } from "./AnimatedMarker";
import {
  Boundary,
  boundaryStyles,
  getMovingMarkers,
  imageConfig,
  mockBoundaries
} from "./data/mock-data";

// Recenter button component
const RecenterButton = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap();
  const handleClick = () => {
    map.fitBounds(bounds, { animate: true, padding: [0, 0] });
  };
  return (
    <button
      onClick={handleClick}
      className="top-4 right-4 z-[1000] absolute bg-white hover:bg-gray-100 shadow px-4 py-2 border border-gray-300 rounded font-medium text-sm"
      style={{ pointerEvents: "auto" }}
    >
      Recenter
    </button>
  );
};

// Helper to get bounds for all boundaries
// function getBoundariesBounds(boundaries: Boundary[]): L.LatLngBoundsExpression {
//   const allPoints = boundaries.flatMap((b) => b.points);
//   const lats = allPoints.map((p) => p.lat);
//   const lngs = allPoints.map((p) => p.lng);
//   const minLat = Math.min(...lats);
//   const maxLat = Math.max(...lats);
//   const minLng = Math.min(...lngs);
//   const maxLng = Math.max(...lngs);
//   return [
//     [minLat, minLng],
//     [maxLat, maxLng]
//   ];
// }

// FitImageBoundsOnce: Only fits bounds on initial mount to prevent unwanted zoom resets on state changes.
const FitImageBoundsOnce = ({
  bounds
}: {
  bounds: L.LatLngBoundsExpression;
}) => {
  const map = useMap();
  const hasFit = useRef(false);
  useEffect(() => {
    if (!hasFit.current) {
      map.fitBounds(bounds, { animate: true, padding: [0, 0] });
      hasFit.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]); // Only run on mount
  return null;
};

// Drawing map click handler component
const DrawingMapClickHandler = ({
  isDrawing,
  onClick
}: {
  isDrawing: boolean;
  onClick: (e: L.LeafletMouseEvent) => void;
}) => {
  const map = useMap();
  useEffect(() => {
    if (!isDrawing) return;
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [map, isDrawing, onClick]);
  return null;
};

const MapDisplay = () => {
  const [selectedBoundary, setSelectedBoundary] = useState<Boundary | null>(
    null
  );
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Add boundary drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<L.LatLngTuple[]>([]);
  const [boundaries, setBoundaries] = useState<Boundary[]>(mockBoundaries);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Move these hooks above the early return
  const [movingMarkers, setMovingMarkers] = useState(() =>
    getMovingMarkers(mockBoundaries)
  );

  useEffect(() => {
    if (!imgSize) return;
    const interval = setInterval(() => {
      setMovingMarkers(getMovingMarkers(boundaries));
    }, 5000);
    return () => clearInterval(interval);
  }, [imgSize, boundaries]);

  // Track map container size
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new window.ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleBoundaryClick = useCallback((boundary: Boundary) => {
    setSelectedBoundary(boundary);
    // You can add more click handling logic here
    console.log("Clicked boundary:", boundary.name);
  }, []);

  // Use the bounds that fit all boundaries
  // const boundariesBounds: L.LatLngBoundsExpression =
  //   getBoundariesBounds(mockBoundaries);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () =>
      setImgSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = imageConfig.url;
  }, []);

  if (!imgSize) return null;

  const imageBounds: L.LatLngBoundsExpression = [
    [0, 0], // botton-left
    [imgSize.height, 0], // top-left
    [0, imgSize.width], // botton-right
    [imgSize.height, imgSize.width] // top-right
  ];

  // Calculate minZoom and maxZoom
  let minZoom = -5,
    maxZoom = 2;
  if (imgSize && containerSize) {
    const zoomFitWidth = Math.log2(containerSize.width / imgSize.width);
    const zoomFitHeight = Math.log2(containerSize.height / imgSize.height);
    minZoom = Math.floor(Math.min(zoomFitWidth, zoomFitHeight));
    maxZoom = 0; // 1:1 pixel mapping
  }

  // Map click handler for drawing
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isDrawing) {
      const lat = Math.max(0, e.latlng.lat);
      const lng = Math.max(0, e.latlng.lng);
      setDrawingPoints((prev) => [...prev, [lat, lng]]);
    }
  };

  // Attach click handler only in drawing mode
  const handleMapCreated = (map: L.Map) => {
    mapRef.current = map;
    map.on("click", handleMapClick);
  };

  return (
    <>
      <PageHeader />
      <main className="flex flex-row mx-auto px-8 md:px-12 py-8 w-full max-w-8xl h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left: Add Boundary Button and Map Section */}
        <div
          ref={mapContainerRef}
          className="relative flex flex-col flex-1 border border-gray-200 rounded-lg h-full overflow-hidden"
        >
          <div className="relative flex-1">
            <MapContainer
              style={{ width: "100%", height: "100%" }}
              bounds={imageBounds}
              minZoom={minZoom}
              maxZoom={maxZoom}
              maxBounds={imageBounds}
              maxBoundsViscosity={0.5}
              crs={L.CRS.Simple}
              dragging={true}
              zoomSnap={0}
              zoomDelta={0.5}
              attributionControl={false}
              className="w-full h-full"
              preferCanvas={true}
            >
              <DrawingMapClickHandler
                isDrawing={isDrawing}
                onClick={handleMapClick}
              />
              {!isDrawing && <FitImageBoundsOnce bounds={imageBounds} />}
              <RecenterButton bounds={imageBounds} />
              <ImageOverlay url={imageConfig.url} bounds={imageBounds} />
              {/* Existing boundaries */}
              {boundaries.map((boundary, bIdx) => (
                <>
                  <Polygon
                    key={boundary.id}
                    positions={boundary.points.map(
                      (p) => [p.lat, p.lng] as L.LatLngTuple
                    )}
                    pathOptions={boundaryStyles[boundary.type]}
                    eventHandlers={{
                      click: () => handleBoundaryClick(boundary),
                      mouseover: (e) => {
                        const layer = e.target;
                        layer.setStyle({ fillOpacity: 0.5 });
                      },
                      mouseout: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                          fillOpacity: boundaryStyles[boundary.type].fillOpacity
                        });
                      }
                    }}
                  />
                  {movingMarkers[bIdx]?.map((marker, idx) => (
                    <AnimatedMarker
                      key={marker.id}
                      id={marker.id}
                      position={[marker.lat, marker.lng]}
                      deviceType={marker.deviceType}
                      tagNumber={idx + 1}
                      color="#2563eb"
                      size={8}
                    />
                  ))}
                </>
              ))}
              {/* Live drawing polygon */}
              {isDrawing && drawingPoints.length > 0 && (
                <Polygon
                  positions={drawingPoints}
                  pathOptions={{ color: "purple", dashArray: "4" }}
                />
              )}
            </MapContainer>
          </div>
        </div>
        {/* Details Panel */}
        <aside className="flex flex-col flex-shrink-0 bg-white shadow mt-8 md:mt-0 ml-0 md:ml-4 p-6 border border-gray-200 rounded-lg w-full md:w-96 h-full overflow-y-auto">
          <div className="flex justify-between">
            {/* Add Boundary Button */}
            <Button
              variant="primary"
              onClick={() => {
                setIsDrawing(true);
                setDrawingPoints([]);
                setSelectedBoundary(null);
              }}
              disabled={isDrawing}
              size="sm"
            >
              {isDrawing ? "Drawing..." : "Add Boundary"}
            </Button>

            {/* Save/Cancel for drawing mode */}
            {isDrawing && (
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (drawingPoints.length >= 3) {
                      setBoundaries([
                        ...boundaries,
                        {
                          id: `user-${Date.now()}`,
                          name: `User Boundary ${boundaries.length + 1}`,
                          type: "safe",
                          points: drawingPoints.map(([lat, lng]) => ({
                            lat,
                            lng
                          }))
                        }
                      ]);
                    }
                    setIsDrawing(false);
                    setDrawingPoints([]);
                  }}
                  disabled={drawingPoints.length < 3}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsDrawing(false);
                    setDrawingPoints([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {selectedBoundary ? (
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">
                  {selectedBoundary.name}
                </h3>
                <Button
                  variant="ghost"
                  className="p-2 h-8"
                  title="Delete boundary"
                  onClick={() => {
                    setBoundaries(
                      boundaries.filter((b) => b.id !== selectedBoundary.id)
                    );
                    setSelectedBoundary(null);
                  }}
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </Button>
              </div>
              <p className="mb-2 text-gray-600 text-sm">
                Type:{" "}
                <span className="capitalize">{selectedBoundary.type}</span>
              </p>
              <div className="mb-2 font-semibold text-gray-500 text-xs">
                Boundary Points:
              </div>
              <ul className="mb-4 text-gray-700 text-xs">
                {selectedBoundary.points.map((pt, idx) => (
                  <li key={idx}>
                    Lat: {pt.lat.toFixed(4)}, Lng: {pt.lng.toFixed(4)}
                  </li>
                ))}
              </ul>
              <div className="mb-2 font-semibold text-gray-500 text-xs">
                Markers:
              </div>
              <ul className="mb-4 text-gray-700 text-xs">
                {(
                  movingMarkers[
                    boundaries.findIndex((b) => b.id === selectedBoundary.id)
                  ] || []
                ).map((marker, idx) => (
                  <li key={marker.id}>
                    <span className="font-mono">Tag #{idx + 1}</span>
                    {` (Device: ${marker.deviceType})`}: Lat:{" "}
                    {marker.lat.toFixed(4)}, Lng: {marker.lng.toFixed(4)}
                  </li>
                ))}
              </ul>
              {/* Add more detailed info here if needed */}
            </div>
          ) : (
            <div className="flex flex-col flex-1 justify-center items-center text-gray-400">
              <span className="mb-2">No boundary selected</span>
              <span className="text-xs">
                Select any boundary on the map to see more info.
              </span>
            </div>
          )}
        </aside>
      </main>
    </>
  );
};

export default MapDisplay;
