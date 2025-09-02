import { PageHeader } from "@/components/ui/page-header";
import L from "leaflet";
import "leaflet-imageoverlay-rotated";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageOverlay, MapContainer, Polygon } from "react-leaflet";
import { AnimatedMarker } from "./AnimatedMarker";
import {
  BoundaryDetails,
  BoundaryForm,
  FitImageBoundsOnce,
  MapControls,
  RecenterButton,
  ScaleIndicator
} from "./components";
import {
  Boundary,
  boundaryStyles,
  getMovingMarkers,
  imageConfig,
  mockBoundaries
} from "./data/mock-data";

const MapDisplay = () => {
  const [selectedBoundary, setSelectedBoundary] = useState<Boundary | null>(
    null
  );
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isAddingBoundary, setIsAddingBoundary] = useState(false);
  const [isEditingBoundary, setIsEditingBoundary] = useState(false);
  const [editingBoundary, setEditingBoundary] = useState<Boundary | null>(null);
  const [newBoundary, setNewBoundary] = useState<Partial<Boundary>>({
    name: "",
    type: "safe",
    points: []
  });
  const [boundaries, setBoundaries] = useState<Boundary[]>(mockBoundaries);
  const [showMarkers, setShowMarkers] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [movingMarkers, setMovingMarkers] = useState<
    {
      id: string;
      x: number;
      y: number;
      deviceType: string;
    }[]
  >([]);

  // Load image and set size
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgSize({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.src = imageConfig.url;
  }, []);

  // Resize observer for container size
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    // Also set initial size manually as fallback
    const rect = mapContainerRef.current.getBoundingClientRect();
    setContainerSize({ width: rect.width, height: rect.height });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Update moving markers
  useEffect(() => {
    const interval = setInterval(() => {
      setMovingMarkers(getMovingMarkers(boundaries).flat());
    }, 1000);

    return () => clearInterval(interval);
  }, [boundaries]);

  // Update scale info when container or image size changes
  useEffect(() => {
    // This effect ensures scale info updates when dependencies change
  }, [containerSize, imgSize]);

  const handleBoundaryClick = useCallback((boundary: Boundary) => {
    setSelectedBoundary(boundary);
  }, []);

  const handleAddBoundary = () => {
    setIsAddingBoundary(true);
    // Randomly assign boundary type
    const types: ("safe" | "warning" | "danger")[] = [
      "safe",
      "warning",
      "danger"
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];

    setNewBoundary({
      name: "",
      type: randomType,
      points: []
    });
  };

  const handleSaveBoundary = () => {
    if (
      newBoundary.name &&
      newBoundary.points &&
      newBoundary.points.length >= 3
    ) {
      // Filter out points where x or y are 0 or null
      const validPoints = newBoundary.points.filter(
        (p) => p.x !== 0 && p.y !== 0 && p.x !== null && p.y !== null
      );

      if (validPoints.length >= 3) {
        const boundary: Boundary = {
          id: `boundary-${Date.now()}`,
          name: newBoundary.name,
          type: newBoundary.type || "safe",
          points: validPoints
        };

        setBoundaries((prev) => [...prev, boundary]);
        setIsAddingBoundary(false);
        setNewBoundary({
          name: "",
          type: "safe",
          points: []
        });
      }
    }
  };

  const handleEditBoundary = (boundary: Boundary) => {
    setEditingBoundary({ ...boundary });
    setIsEditingBoundary(true);
  };

  const handleSaveEditedBoundary = () => {
    if (
      editingBoundary &&
      editingBoundary.name &&
      editingBoundary.points &&
      editingBoundary.points.length >= 3
    ) {
      // Filter out points where x or y are 0 or null
      const validPoints = editingBoundary.points.filter(
        (p) => p.x !== 0 && p.y !== 0 && p.x !== null && p.y !== null
      );

      if (validPoints.length >= 3) {
        const updatedBoundary = {
          ...editingBoundary,
          points: validPoints
        };

        setBoundaries((prev) =>
          prev.map((b) => (b.id === editingBoundary.id ? updatedBoundary : b))
        );
        setIsEditingBoundary(false);
        setEditingBoundary(null);
        setSelectedBoundary(updatedBoundary);
      }
    }
  };

  const handleDeleteBoundary = (id: string) => {
    setBoundaries((prev) => prev.filter((b) => b.id !== id));
    if (selectedBoundary?.id === id) {
      setSelectedBoundary(null);
    }
  };

  const handleAddPoint = () => {
    setNewBoundary((prev) => ({
      ...prev,
      points: [...(prev.points || []), { x: 0, y: 0 }]
    }));
  };

  const handleRemovePoint = (index: number) => {
    setNewBoundary((prev) => ({
      ...prev,
      points: prev.points?.filter((_, i) => i !== index) || []
    }));
  };

  const handleCoordinateChange = (
    index: number,
    field: "x" | "y",
    value: number
  ) => {
    setNewBoundary((prev) => ({
      ...prev,
      points:
        prev.points?.map((p, i) =>
          i === index ? { ...p, [field]: value } : p
        ) || []
    }));
  };

  const handleEditAddPoint = () => {
    if (editingBoundary) {
      setEditingBoundary({
        ...editingBoundary,
        points: [...editingBoundary.points, { x: 0, y: 0 }]
      });
    }
  };

  const handleEditRemovePoint = (index: number) => {
    if (editingBoundary) {
      setEditingBoundary({
        ...editingBoundary,
        points: editingBoundary.points.filter((_, i) => i !== index)
      });
    }
  };

  const handleEditCoordinateChange = (
    index: number,
    field: "x" | "y",
    value: number
  ) => {
    if (editingBoundary) {
      setEditingBoundary({
        ...editingBoundary,
        points: editingBoundary.points.map((p, i) =>
          i === index ? { ...p, [field]: value } : p
        )
      });
    }
  };

  const handleCancelAdd = () => {
    setIsAddingBoundary(false);
    setNewBoundary({
      name: "",
      type: "safe",
      points: []
    });
  };

  const handleCancelEdit = () => {
    setIsEditingBoundary(false);
    setEditingBoundary(null);
  };

  // Early return if imgSize is not available
  if (!imgSize) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader pageName="Map Display" />
        <main className="flex flex-col mx-auto px-8 md:px-12 py-8 w-full max-w-8xl h-[calc(100vh-4rem)]">
          <div className="flex flex-1 justify-center items-center">
            <div className="text-center">
              <div className="mx-auto mb-4 border-gray-900 border-b-2 rounded-full w-32 h-32 animate-spin"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [imgSize.height, imgSize.width]
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader pageName="Map Display" />

      <main className="flex flex-row mx-auto px-8 md:px-12 py-8 w-full max-w-8xl h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left: Map Section */}
        <div
          ref={mapContainerRef}
          className="relative flex-1 border border-gray-200 rounded-lg overflow-hidden"
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
            <ImageOverlay url={imageConfig.url} bounds={bounds} />

            {/* Existing boundaries */}
            {boundaries.map((boundary) => {
              // Filter out any points with NaN values
              const validPoints = boundary.points.filter(
                (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
              );

              if (validPoints.length < 3) return null;

              return (
                <Polygon
                  key={boundary.id}
                  positions={validPoints.map((p) => [p.x, p.y])}
                  pathOptions={boundaryStyles[boundary.type]}
                  eventHandlers={{
                    click: () => handleBoundaryClick(boundary)
                  }}
                />
              );
            })}

            {/* New boundary preview (purple) */}
            {isAddingBoundary &&
              newBoundary.points &&
              newBoundary.points.length >= 3 &&
              (() => {
                // Filter out any points with NaN values
                const validPoints = newBoundary.points.filter(
                  (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
                );

                if (validPoints.length < 3) return null;

                return (
                  <Polygon
                    positions={validPoints.map((p) => [p.x, p.y])}
                    pathOptions={{
                      color: "purple",
                      fillColor: "purple",
                      fillOpacity: 0.3,
                      weight: 2
                    }}
                  />
                );
              })()}

            {/* Editing boundary preview (orange) */}
            {isEditingBoundary &&
              editingBoundary &&
              editingBoundary.points.length >= 3 &&
              (() => {
                // Filter out any points with NaN values
                const validPoints = editingBoundary.points.filter(
                  (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
                );

                if (validPoints.length < 3) return null;

                return (
                  <Polygon
                    positions={validPoints.map((p) => [p.x, p.y])}
                    pathOptions={{
                      color: "orange",
                      fillColor: "orange",
                      fillOpacity: 0.3,
                      weight: 2
                    }}
                  />
                );
              })()}

            {/* Show markers if enabled */}
            {showMarkers &&
              movingMarkers.map((marker, index) => (
                <AnimatedMarker
                  key={marker.id}
                  id={marker.id}
                  position={[marker.x, marker.y]}
                  deviceType={marker.deviceType}
                  tagNumber={index + 1}
                />
              ))}

            <RecenterButton bounds={bounds} />
            <FitImageBoundsOnce bounds={bounds} />
          </MapContainer>

          {/* Scale indicator positioned outside MapContainer */}
          <ScaleIndicator containerSize={containerSize} imgSize={imgSize} />
        </div>

        {/* Right Sidebar */}
        <aside className="flex flex-col flex-shrink-0 bg-white shadow mt-8 md:mt-0 ml-0 md:ml-4 p-6 border border-gray-200 rounded-lg w-full md:w-96 h-full overflow-y-auto">
          <MapControls
            showMarkers={showMarkers}
            onShowMarkersChange={setShowMarkers}
            onAddBoundary={handleAddBoundary}
          />

          {isAddingBoundary && (
            <BoundaryForm
              mode="add"
              boundary={newBoundary}
              onBoundaryChange={setNewBoundary}
              onSave={handleSaveBoundary}
              onCancel={handleCancelAdd}
              onAddPoint={handleAddPoint}
              onRemovePoint={handleRemovePoint}
              onCoordinateChange={handleCoordinateChange}
            />
          )}

          {isEditingBoundary && editingBoundary && (
            <BoundaryForm
              mode="edit"
              boundary={editingBoundary}
              onBoundaryChange={(boundary) =>
                setEditingBoundary(boundary as Boundary)
              }
              onSave={handleSaveEditedBoundary}
              onCancel={handleCancelEdit}
              onAddPoint={handleEditAddPoint}
              onRemovePoint={handleEditRemovePoint}
              onCoordinateChange={handleEditCoordinateChange}
            />
          )}

          {selectedBoundary && !isAddingBoundary && !isEditingBoundary && (
            <BoundaryDetails
              boundary={selectedBoundary}
              showMarkers={showMarkers}
              movingMarkers={movingMarkers}
              onEdit={handleEditBoundary}
              onDelete={handleDeleteBoundary}
            />
          )}

          {!selectedBoundary && !isAddingBoundary && !isEditingBoundary && (
            <div className="py-8 text-gray-500 text-center">
              <p>Select a boundary to view details</p>
              <p className="mt-2 text-sm">
                Or click "Add Boundary" to create a new one
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default MapDisplay;
