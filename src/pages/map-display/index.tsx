import { PageHeader } from "@/components/ui/page-header";
import L, { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import "leaflet-imageoverlay-rotated";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useState } from "react";
import { ImageOverlay, MapContainer, Polygon, useMap } from "react-leaflet";
import {
  Boundary,
  boundaryStyles,
  imageConfig,
  mockBoundaries
} from "./data/mock-data";

// Recenter button component
const RecenterButton = ({ bounds }: { bounds: LatLngBoundsExpression }) => {
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
// function getBoundariesBounds(boundaries: Boundary[]): LatLngBoundsExpression {
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

// Helper to fit image bounds only once on mount (with animation)
const FitImageBoundsOnce = ({ bounds }: { bounds: LatLngBoundsExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { animate: true, padding: [0, 0] });
  }, [map, bounds]);
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

  const handleBoundaryClick = useCallback((boundary: Boundary) => {
    setSelectedBoundary(boundary);
    // You can add more click handling logic here
    console.log("Clicked boundary:", boundary.name);
  }, []);

  // Use the bounds that fit all boundaries
  // const boundariesBounds: LatLngBoundsExpression =
  //   getBoundariesBounds(mockBoundaries);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () =>
      setImgSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = imageConfig.url;
  }, []);

  if (!imgSize) return null;

  const imageBounds: LatLngBoundsExpression = [
    [0, 0], // botton-left
    [imgSize.width, 0], // bottom-right
    [0, imgSize.height], // top-left
    [imgSize.width, imgSize.height] // top-right
  ];

  return (
    <>
      <PageHeader />
      <main className="flex flex-row mx-auto px-8 md:px-12 py-8 w-full max-w-8xl h-[calc(100vh-4rem)] overflow-hidden">
        {/* Map Section */}
        <div className="relative flex flex-1 border border-gray-200 rounded-lg h-full overflow-hidden">
          <MapContainer
            style={{ width: "100%", height: "100%" }}
            bounds={imageBounds}
            minZoom={-2}
            maxZoom={2}
            maxBounds={imageBounds}
            maxBoundsViscosity={0.5}
            crs={L.CRS.Simple}
            dragging={true}
            zoomSnap={0}
            zoomDelta={0.5}
            attributionControl={false}
            className="w-full h-full"
            preferCanvas={true}
            // Use the bounds that fit all boundaries
            // bounds={boundariesBounds}
            // Use the image bounds for the map
          >
            <FitImageBoundsOnce bounds={imageBounds} />
            <RecenterButton bounds={imageBounds} />
            <ImageOverlay url={imageConfig.url} bounds={imageBounds} />
            {mockBoundaries.map((boundary) => (
              <Polygon
                key={boundary.id}
                positions={boundary.points.map(
                  (p) => [p.lat, p.lng] as LatLngTuple
                )}
                pathOptions={boundaryStyles[boundary.type]}
                eventHandlers={{
                  click: () => handleBoundaryClick(boundary),
                  mouseover: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                      fillOpacity: 0.5
                    });
                  },
                  mouseout: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                      fillOpacity: boundaryStyles[boundary.type].fillOpacity
                    });
                  }
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Details Panel */}
        <aside className="flex-shrink-0 bg-white shadow mt-8 md:mt-0 ml-0 md:ml-4 p-6 border border-gray-200 rounded-lg w-full md:w-96 h-full overflow-y-auto">
          {selectedBoundary ? (
            <>
              <h3 className="mb-2 font-semibold text-lg">
                {selectedBoundary.name}
              </h3>
              <p className="mb-2 text-gray-600 text-sm">
                Type:{" "}
                <span className="capitalize">{selectedBoundary.type}</span>
              </p>
              <div className="mb-2 text-gray-500 text-xs">Boundary Points:</div>
              <ul className="mb-4 text-gray-700 text-xs">
                {selectedBoundary.points.map((pt, idx) => (
                  <li key={idx}>
                    Lat: {pt.lat}, Lng: {pt.lng}
                  </li>
                ))}
              </ul>
              {/* Add more detailed info here if needed */}
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-400">
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
