import { PageHeader } from "@/components/ui/page-header";
import L, { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import "leaflet-imageoverlay-rotated";
import "leaflet/dist/leaflet.css";
import React, { useCallback, useState } from "react";
import { ImageOverlay, MapContainer, Polygon, useMap } from "react-leaflet";
import {
  Boundary,
  boundaryStyles,
  imageConfig,
  mockBoundaries
} from "./data/mock-data";

// Helper to fit bounds on mount
const FitImageBounds = ({ bounds }: { bounds: LatLngBoundsExpression }) => {
  const map = useMap();
  React.useEffect(() => {
    map.fitBounds(bounds, { animate: false, padding: [0, 0] });
  }, [map, bounds]);
  return null;
};

// Helper to get bounds for all boundaries
function getBoundariesBounds(boundaries: Boundary[]): LatLngBoundsExpression {
  const allPoints = boundaries.flatMap((b) => b.points);
  const lats = allPoints.map((p) => p.lat);
  const lngs = allPoints.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return [
    [minLat, minLng],
    [maxLat, maxLng]
  ];
}

// Recenter button component
const RecenterButton = ({ bounds }: { bounds: LatLngBoundsExpression }) => {
  const map = useMap();
  const handleClick = () => {
    map.fitBounds(bounds, { animate: true, padding: [0, 0] });
  };
  return (
    <button
      onClick={handleClick}
      className="absolute z-[1000] top-4 right-4 bg-white border border-gray-300 rounded shadow px-4 py-2 text-sm font-medium hover:bg-gray-100"
      style={{ pointerEvents: "auto" }}
    >
      Recenter
    </button>
  );
};

// Helper to lock minZoom to the current zoom after fitting bounds
const LockMinZoom = () => {
  const map = useMap();
  React.useEffect(() => {
    const currentZoom = map.getZoom();
    map.setMinZoom(currentZoom);
    map.setZoom(currentZoom); // Ensure we're at minZoom
  }, [map]);
  return null;
};

// Helper to auto recenter on last zoom out
const AutoRecenterOnMinZoom = ({
  bounds
}: {
  bounds: LatLngBoundsExpression;
}) => {
  const map = useMap();
  React.useEffect(() => {
    const handleZoomEnd = () => {
      if (map.getZoom() === map.getMinZoom()) {
        map.fitBounds(bounds, { animate: true, padding: [0, 0] });
      }
    };
    map.on("zoomend", handleZoomEnd);
    return () => {
      map.off("zoomend", handleZoomEnd);
    };
  }, [map, bounds]);
  return null;
};

const MapDisplay = () => {
  const [selectedBoundary, setSelectedBoundary] = useState<Boundary | null>(
    null
  );

  const handleBoundaryClick = useCallback((boundary: Boundary) => {
    setSelectedBoundary(boundary);
    // You can add more click handling logic here
    console.log("Clicked boundary:", boundary.name);
  }, []);

  // Use the bounds that fit all boundaries
  const boundariesBounds: LatLngBoundsExpression =
    getBoundariesBounds(mockBoundaries);

  return (
    <>
      <PageHeader />
      <main className="flex flex-col mx-auto px-8 md:px-12 py-8 w-full max-w-8xl h-[calc(100vh-4rem)] overflow-hidden">
        <div
          className="relative border border-gray-200 rounded-lg w-full h-full overflow-hidden"
          style={{ minHeight: 400 }}
        >
          <MapContainer
            style={{ width: "100%", height: "100%" }}
            bounds={boundariesBounds}
            crs={L.CRS.Simple}
            // zoom={10}
            // minZoom={5}
            maxZoom={30}
            // scrollWheelZoom={false}
            // boxZoom={false}
          >
            <FitImageBounds bounds={boundariesBounds} />
            {/* <LockMinZoom /> */}
            <AutoRecenterOnMinZoom bounds={boundariesBounds} />
            <RecenterButton bounds={boundariesBounds} />
            <ImageOverlay
              url={imageConfig.url}
              bounds={[
                [0, 0],
                [100, 100]
              ]}
            />
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

          {/* Selected boundary info overlay */}
          {selectedBoundary && (
            <div className="bottom-4 left-4 absolute bg-white shadow-lg p-4 rounded-lg">
              <h3 className="font-semibold">{selectedBoundary.name}</h3>
              <p className="text-gray-600 text-sm">
                Type: {selectedBoundary.type}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default MapDisplay;
