import { PageHeader } from "@/components/ui/page-header";
import { Port, generateAllPorts } from "@/types/common/ports";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapSection, MapSidebar } from "./components";
import {
  Boundary,
  imageConfig,
  mockBoundaries,
  mockPortMarkers
} from "./data/mock-data";
import {
  useBoundaryState,
  useMapHandlers,
  useMapState,
  useMapUtils,
  usePortState
} from "./hooks";
import { PortMarker } from "./types";
import { getAvailablePorts } from "./utils";

const MapDisplay = () => {
  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Custom hooks for state management
  const {
    mapContainerRef,
    imgSize,
    setImgSize,
    containerSize,
    setContainerSize
  } = useMapState();
  const {
    selectedBoundary,
    setSelectedBoundary,
    isDrawing,
    setIsDrawing,
    drawingPoints,
    setDrawingPoints,
    boundaries,
    setBoundaries,
    pendingBoundarySave,
    setPendingBoundarySave
  } = useBoundaryState();
  const {
    portMarkers,
    setPortMarkers,
    isAddingPort,
    setIsAddingPort,
    selectedPort,
    setSelectedPort,
    pendingPortPlacements,
    addPendingPort,
    removePendingPort,
    clearPendingPorts,
    updatePendingPortCoordinates
  } = usePortState();

  // Initialize with mock data
  useEffect(() => {
    setBoundaries(mockBoundaries);
    setPortMarkers(mockPortMarkers);
  }, [setBoundaries, setPortMarkers]);

  const [allPorts] = useState<Port[]>(generateAllPorts(true));

  // Custom hooks for utilities and handlers
  const { isPointInPolygon } = useMapUtils();
  const { handleMapClick, handleBoundaryClick, handleBoundaryClickForPort } =
    useMapHandlers(
      isDrawing,
      isAddingPort,
      selectedPort,
      boundaries,
      drawingPoints,
      setDrawingPoints,
      setSelectedBoundary,
      addPendingPort,
      isPointInPolygon
    );

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
  }, [setImgSize]);

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
  }, [mapContainerRef, setContainerSize]);

  // Update scale info when container or image size changes
  useEffect(() => {
    // This effect ensures scale info updates when dependencies change
  }, [containerSize, imgSize]);

  const handleAddBoundary = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
    setSelectedBoundary(null);
  };

  // const handleSaveBoundary = () => {
  //   if (drawingPoints.length >= 3) {
  //     // Show confirmation dialog instead of immediately saving
  //     setPendingBoundarySave({
  //       points: drawingPoints,
  //       boundaryName: `User Boundary ${boundaries.length + 1}`
  //     });
  //   }
  // };

  const handleConfirmBoundarySave = () => {
    const boundaryName =
      pendingBoundarySave?.boundaryName ||
      `User Boundary ${boundaries.length + 1}`;

    // Randomly assign boundary type
    const types: ("safe" | "warning" | "danger")[] = [
      "safe",
      "warning",
      "danger"
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const boundary: Boundary = {
      id: `boundary-${Date.now()}`,
      name: boundaryName,
      type: randomType,
      points: drawingPoints.map(([lat, lng]) => ({
        x: lng, // Convert lat/lng to x/y
        y: lat
      }))
    };

    setBoundaries((prev) => [...prev, boundary]);
    setPendingBoundarySave(null);
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  // const handleCancelBoundarySave = () => {
  //   setPendingBoundarySave(null);
  // };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  const handleDeleteBoundary = (id: string) => {
    setBoundaries((prev) => prev.filter((b) => b.id !== id));
    // Also delete all ports within this boundary
    setPortMarkers((prev) => prev.filter((marker) => marker.boundaryId !== id));
    if (selectedBoundary?.id === id) {
      setSelectedBoundary(null);
    }
  };

  // Port marker handlers
  const handleAddPortMode = () => {
    setIsAddingPort(true);
    setSelectedPort(null);
    setSelectedBoundary(null);
  };

  const handlePortSelection = (port: Port) => {
    setSelectedPort(port);
  };

  const handleDeletePortMarker = (markerId: string) => {
    setPortMarkers((prev) => prev.filter((m) => m.id !== markerId));
  };

  const handleCancelAddPort = () => {
    setIsAddingPort(false);
    setSelectedPort(null);
    clearPendingPorts();
  };

  const handleSavePortPlacements = () => {
    if (pendingPortPlacements.length > 0) {
      // Find boundaries for each pending port placement
      const newPortMarkers: PortMarker[] = pendingPortPlacements.map(
        (previewMarker) => {
          // Find which boundary contains this port
          const containingBoundary = boundaries.find((boundary) => {
            const validPoints = boundary.points.filter(
              (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
            );

            if (validPoints.length < 3) return false;

            return isPointInPolygon(previewMarker.coordinates, validPoints);
          });

          return {
            id: `port-marker-${Date.now()}-${Math.random()}`,
            port: previewMarker.port,
            boundaryId: containingBoundary?.id || "unknown",
            position: previewMarker.coordinates
          };
        }
      );

      setPortMarkers((prev) => [...prev, ...newPortMarkers]);
      clearPendingPorts();
      setIsAddingPort(false);
      setSelectedPort(null);
    }
  };

  // Early return if imgSize is not available
  if (!imgSize) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader pageName="Map Display" />
        <main className="flex flex-col mx-auto px-8 md:px-12 py-8 w-full max-w-8xl h-[calc(100vh-4rem)]">
          <div className="flex flex-1 justify-center items-center">
            <div className="text-center">
              <div className="mx-auto mb-4 border-neutral-900 dark:border-neutral-100 border-b-2 rounded-full w-32 h-32 animate-spin"></div>
              <p className="text-neutral-600 dark:text-neutral-400">
                Loading map...
              </p>
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
        <MapSection
          mapContainerRef={mapContainerRef}
          bounds={bounds}
          imageUrl={imageConfig.url}
          isDrawing={isDrawing}
          isAddingPort={isAddingPort}
          drawingPoints={drawingPoints}
          boundaries={boundaries}
          portMarkers={portMarkers}
          previewPortMarkers={pendingPortPlacements}
          selectedBoundary={selectedBoundary}
          containerSize={containerSize}
          imgSize={imgSize}
          isSidebarCollapsed={isSidebarCollapsed}
          onMapClick={handleMapClick}
          onBoundaryClick={handleBoundaryClick}
          onBoundaryClickForPort={handleBoundaryClickForPort}
        />

        <MapSidebar
          isDrawing={isDrawing}
          isAddingPort={isAddingPort}
          drawingPoints={drawingPoints}
          pendingBoundarySave={pendingBoundarySave}
          availablePorts={getAvailablePorts(
            allPorts,
            portMarkers,
            pendingPortPlacements
          )}
          selectedPort={selectedPort}
          pendingPortPlacements={pendingPortPlacements}
          selectedBoundary={selectedBoundary}
          portMarkers={portMarkers}
          boundaries={boundaries}
          boundariesCount={boundaries.length}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={setIsSidebarCollapsed}
          onAddBoundary={handleAddBoundary}
          onCancelDrawing={handleCancelDrawing}
          onAddPortMode={handleAddPortMode}
          onCancelAddPort={handleCancelAddPort}
          onPortSelect={handlePortSelection}
          onSavePortPlacements={handleSavePortPlacements}
          onRemovePendingPort={removePendingPort}
          onUpdatePendingPortCoordinates={updatePendingPortCoordinates}
          onBoundaryNameChange={(name) => {
            if (!pendingBoundarySave) {
              setPendingBoundarySave({
                points: drawingPoints,
                boundaryName: name
              });
            } else {
              setPendingBoundarySave({
                ...pendingBoundarySave,
                boundaryName: name
              });
            }
          }}
          onConfirmBoundarySave={handleConfirmBoundarySave}
          onUpdateDrawingPoint={(index, coordinates) => {
            setDrawingPoints((prev) => {
              const newPoints = [...prev];
              newPoints[index] = coordinates;
              return newPoints;
            });
          }}
          onDeleteBoundary={handleDeleteBoundary}
          onDeletePortMarker={handleDeletePortMarker}
          onUpdatePortMarkerCoordinates={(markerId, coordinates) => {
            setPortMarkers((prev) =>
              prev.map((marker) =>
                marker.id === markerId
                  ? { ...marker, position: coordinates }
                  : marker
              )
            );
          }}
        />
      </main>
    </div>
  );
};

export default MapDisplay;
