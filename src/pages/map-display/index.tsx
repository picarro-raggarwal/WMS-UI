import { PageHeader } from "@/components/ui/page-header";
import { RootState } from "@/lib/store";
import { Port } from "@/types/common/ports";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
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
import {
  calculateBoundaryType,
  getAvailablePorts,
  getRandomConcentration,
  getStatusFromConcentration
} from "./utils";

const MapDisplay = () => {
  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Color blending toggle state
  const [isColorBlendingEnabled, setIsColorBlendingEnabled] = useState(true);
  // Color blending calculation loading state
  const [isColorBlendingCalculating, setIsColorBlendingCalculating] =
    useState(false);

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

  // Recalculate boundary types when port markers change
  useEffect(() => {
    setBoundaries((prevBoundaries) =>
      prevBoundaries.map((boundary) => ({
        ...boundary,
        type: calculateBoundaryType(boundary.id, portMarkers)
      }))
    );
  }, [portMarkers, setBoundaries]);

  // Get inlets from global state (APIs are triggered at app mount)
  const globalInlets = useSelector(
    (state: RootState) => (state as any).settingsGlobal?.inlets
  );

  // Generate ports from global state inlets - only isEnabled PORT type
  const allPorts = useMemo<Port[]>(() => {
    // If global state is empty, return empty array (APIs are being fetched)
    if (!globalInlets?.result || globalInlets.result.length === 0) {
      return [];
    }

    // Filter to only PORT type and isEnabled inlets
    const enabledPortInlets = globalInlets.result.filter(
      (inlet) => inlet.type === "PORT" && inlet.isEnabled === true
    );

    // Transform inlets to Port format
    const ports: Port[] = enabledPortInlets.map((inlet) => ({
      id: `inlet-${inlet.id}`,
      portNumber: inlet.portId,
      name: inlet.displayLabel,
      type: "regular" as const,
      bankNumber: inlet.bankId,
      enabled: true
    }));

    return ports;
  }, [globalInlets]);

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

  const handleToggleColorBlending = (enabled: boolean) => {
    setIsColorBlendingEnabled(enabled);
    // Immediately show loading state when enabling, if there are boundaries with ports
    if (enabled) {
      const hasBoundariesWithPorts = boundaries.some((boundary) => {
        return portMarkers.some(
          (marker) =>
            marker.boundaryId === boundary.id && marker.status !== undefined
        );
      });
      if (hasBoundariesWithPorts) {
        setIsColorBlendingCalculating(true);
      }
    } else {
      // Clear loading state when disabling
      setIsColorBlendingCalculating(false);
    }
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

    const boundary: Boundary = {
      id: `boundary-${Date.now()}`,
      name: boundaryName,
      type: 0, // Will be calculated based on port statuses
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
      // Find boundaries for each pending port placement and validate they're inside
      const newPortMarkers: PortMarker[] = pendingPortPlacements
        .map((previewMarker) => {
          // Find which boundary contains this port
          const containingBoundary = boundaries.find((boundary) => {
            const validPoints = boundary.points.filter(
              (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
            );

            if (validPoints.length < 3) return false;

            return isPointInPolygon(previewMarker.coordinates, validPoints);
          });

          // Only create marker if port is inside a valid boundary
          if (containingBoundary) {
            // Generate concentration and status using same logic as live-data
            const concentration = getRandomConcentration();
            const status = getStatusFromConcentration(concentration);
            return {
              id: `port-marker-${Date.now()}-${Math.random()}`,
              port: previewMarker.port,
              boundaryId: containingBoundary.id,
              position: previewMarker.coordinates,
              status
            } as PortMarker;
          }
          return null;
        })
        .filter((marker): marker is PortMarker => marker !== null); // Filter out nulls

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
          isColorBlendingEnabled={isColorBlendingEnabled}
          isColorBlendingCalculating={isColorBlendingCalculating}
          onColorBlendingCalculatingChange={setIsColorBlendingCalculating}
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
          isColorBlendingEnabled={isColorBlendingEnabled}
          isColorBlendingCalculating={isColorBlendingCalculating}
          onToggleCollapse={setIsSidebarCollapsed}
          onToggleColorBlending={handleToggleColorBlending}
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
              prev.map((marker) => {
                if (marker.id === markerId) {
                  // Validate that new coordinates are inside the boundary
                  const boundary = boundaries.find(
                    (b) => b.id === marker.boundaryId
                  );
                  if (boundary) {
                    const validPoints = boundary.points.filter(
                      (p) =>
                        !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
                    );
                    if (
                      validPoints.length >= 3 &&
                      isPointInPolygon(coordinates, validPoints)
                    ) {
                      return { ...marker, position: coordinates };
                    }
                    // If outside boundary, keep original position
                    return marker;
                  }
                }
                return marker;
              })
            );
          }}
        />
      </main>
    </div>
  );
};

export default MapDisplay;
