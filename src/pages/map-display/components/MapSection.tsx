import L from "leaflet";
import { ImageOverlay, MapContainer, Polygon } from "react-leaflet";
import { Boundary, PortMarker, PreviewPortMarker } from "../types";
import { MapClickHandler } from "../utils";
import { BoundaryLabel } from "./BoundaryLabel";
import { FitImageBoundsOnce, RecenterButton } from "./MapComponents";
import { PortMarkerComponent } from "./PortMarker";
import { PreviewPortMarker as PreviewPortMarkerComponent } from "./PreviewPortMarker";
import { ScaleIndicator } from "./ScaleIndicator";
import { VertexMarker } from "./VertexMarker";

interface MapSectionProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  bounds: L.LatLngBoundsExpression;
  imageUrl: string;
  isDrawing: boolean;
  isAddingPort: boolean;
  drawingPoints: L.LatLngTuple[];
  boundaries: Boundary[];
  portMarkers: PortMarker[];
  previewPortMarkers: PreviewPortMarker[];
  selectedBoundary: Boundary | null;
  containerSize: { width: number; height: number } | null;
  imgSize: { width: number; height: number } | null;
  onMapClick: (e: L.LeafletMouseEvent) => void;
  onBoundaryClick: (boundary: Boundary) => void;
  onBoundaryClickForPort: (boundary: Boundary, e: L.LeafletMouseEvent) => void;
}

export const MapSection = ({
  mapContainerRef,
  bounds,
  imageUrl,
  isDrawing,
  isAddingPort,
  drawingPoints,
  boundaries,
  portMarkers,
  previewPortMarkers,
  selectedBoundary,
  containerSize,
  imgSize,
  onMapClick,
  onBoundaryClick,
  onBoundaryClickForPort
}: MapSectionProps) => {
  return (
    <div
      ref={mapContainerRef}
      className="relative flex-1 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden"
    >
      <MapContainer
        bounds={bounds}
        style={{ width: "100%", height: "100%" }}
        minZoom={-5}
        maxZoom={2}
        maxBounds={bounds}
        maxBoundsViscosity={0.5}
        crs={L.CRS.Simple}
        dragging={true}
        zoomSnap={0}
        zoomDelta={0.5}
        attributionControl={false}
        className="w-full h-full"
        preferCanvas={true}
      >
        <MapClickHandler
          isDrawing={isDrawing}
          isAddingPort={isAddingPort}
          onClick={onMapClick}
        />
        <ImageOverlay url={imageUrl} bounds={bounds} />

        {/* Existing boundaries */}
        {boundaries.map((boundary) => {
          // Filter out any points with NaN values
          const validPoints = boundary.points.filter(
            (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
          );

          if (validPoints.length < 3) return null;

          const isSelected = selectedBoundary?.id === boundary.id;

          return (
            <div key={boundary.id}>
              <Polygon
                positions={validPoints.map((p) => [p.y, p.x])}
                pathOptions={{
                  color:
                    boundary.type === "safe"
                      ? "#10b981"
                      : boundary.type === "warning"
                      ? "#f59e0b"
                      : "#ef4444",
                  weight: 2,
                  fillOpacity: 0.1,
                  ...(isSelected && {
                    color: "#3b82f6",
                    weight: 4,
                    fillOpacity: 0.2
                  })
                }}
                eventHandlers={{
                  click: (e) => onBoundaryClickForPort(boundary, e)
                }}
              />
              <BoundaryLabel
                boundary={boundary}
                portMarkers={portMarkers}
                onClick={onBoundaryClick}
                isAddingPort={isAddingPort}
                isSelected={isSelected}
              />
              {/* Show vertex markers for selected boundary */}
              {isSelected &&
                validPoints.map((point, idx) => (
                  <VertexMarker
                    key={`boundary-vertex-${boundary.id}-${idx}`}
                    position={[point.y, point.x]}
                    vertexNumber={idx + 1}
                  />
                ))}
            </div>
          );
        })}

        {/* Live drawing polygon */}
        {isDrawing && drawingPoints.length > 0 && (
          <>
            <Polygon
              positions={drawingPoints}
              pathOptions={{ color: "purple", dashArray: "4" }}
            />
            {drawingPoints.map((point, idx) => (
              <VertexMarker
                key={`drawing-vertex-${idx}`}
                position={point.slice(0, 2) as [number, number]}
                vertexNumber={idx + 1}
              />
            ))}
          </>
        )}

        {/* Port markers */}
        {portMarkers.map((marker) => (
          <PortMarkerComponent key={marker.id} marker={marker} />
        ))}

        {/* Preview port markers */}
        {previewPortMarkers.map((previewMarker) => (
          <PreviewPortMarkerComponent
            key={previewMarker.id}
            previewMarker={previewMarker}
          />
        ))}

        <RecenterButton bounds={bounds} />
        <FitImageBoundsOnce bounds={bounds} />
      </MapContainer>

      {/* Scale indicator positioned outside MapContainer */}
      <ScaleIndicator containerSize={containerSize} imgSize={imgSize} />
    </div>
  );
};
