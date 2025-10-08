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
    pendingPortPlacement,
    setPendingPortPlacement
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
      setPendingPortPlacement,
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
    // Reset pending placement when port selection changes
    setPendingPortPlacement(null);
  };

  const handleDeletePortMarker = (markerId: string) => {
    setPortMarkers((prev) => prev.filter((m) => m.id !== markerId));
  };

  const handleCancelAddPort = () => {
    setIsAddingPort(false);
    setSelectedPort(null);
    setPendingPortPlacement(null);
  };

  const handleSavePortPlacement = () => {
    if (pendingPortPlacement) {
      const newPortMarker: PortMarker = {
        id: `port-marker-${Date.now()}`,
        port: pendingPortPlacement.port,
        boundaryId: pendingPortPlacement.boundary.id,
        position: pendingPortPlacement.coordinates
      };

      setPortMarkers((prev) => [...prev, newPortMarker]);
      setPendingPortPlacement(null);
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
          selectedBoundary={selectedBoundary}
          containerSize={containerSize}
          imgSize={imgSize}
          onMapClick={handleMapClick}
          onBoundaryClick={handleBoundaryClick}
          onBoundaryClickForPort={handleBoundaryClickForPort}
        />

        <MapSidebar
          isDrawing={isDrawing}
          isAddingPort={isAddingPort}
          drawingPoints={drawingPoints}
          pendingBoundarySave={pendingBoundarySave}
          availablePorts={getAvailablePorts(allPorts, portMarkers)}
          selectedPort={selectedPort}
          pendingPortPlacement={pendingPortPlacement}
          selectedBoundary={selectedBoundary}
          portMarkers={portMarkers}
          boundariesCount={boundaries.length}
          onAddBoundary={handleAddBoundary}
          onCancelDrawing={handleCancelDrawing}
          onAddPortMode={handleAddPortMode}
          onCancelAddPort={handleCancelAddPort}
          onPortSelect={handlePortSelection}
          onSavePortPlacement={handleSavePortPlacement}
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
          onDeleteBoundary={handleDeleteBoundary}
          onDeletePortMarker={handleDeletePortMarker}
        />
      </main>
    </div>
  );
};

export default MapDisplay;
