import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Port } from "@/types/common/ports";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  MapPin,
  PenTool
} from "lucide-react";
import {
  Boundary,
  PendingBoundarySave,
  PortMarker,
  PreviewPortMarker
} from "../types";
import { BoundaryDetails } from "./BoundaryDetails";
import { DrawingControls } from "./DrawingControls";
import { MapControls } from "./MapControls";
import { PortControls } from "./PortControls";

interface MapSidebarProps {
  // Sidebar collapse state
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;

  // Drawing state
  isDrawing: boolean;
  isAddingPort: boolean;
  drawingPoints: L.LatLngTuple[];
  pendingBoundarySave: PendingBoundarySave | null;

  // Port state
  availablePorts: Port[];
  selectedPort: Port | null;
  pendingPortPlacements: PreviewPortMarker[];

  // Boundary state
  selectedBoundary: Boundary | null;
  portMarkers: PortMarker[];
  boundaries: Boundary[];
  boundariesCount: number;

  // Handlers
  onAddBoundary: () => void;
  onCancelDrawing: () => void;
  onAddPortMode: () => void;
  onCancelAddPort: () => void;
  onPortSelect: (port: Port) => void;
  onSavePortPlacements: () => void;
  onRemovePendingPort: (id: string) => void;
  onUpdatePendingPortCoordinates: (
    id: string,
    coordinates: { x: number; y: number }
  ) => void;
  onBoundaryNameChange: (name: string) => void;
  onConfirmBoundarySave: () => void;
  onUpdateDrawingPoint: (index: number, coordinates: L.LatLngTuple) => void;
  onDeleteBoundary: (id: string) => void;
  onDeletePortMarker: (markerId: string) => void;
  onUpdatePortMarkerCoordinates: (
    markerId: string,
    coordinates: { x: number; y: number }
  ) => void;
}

export const MapSidebar = ({
  isCollapsed,
  onToggleCollapse,
  isDrawing,
  isAddingPort,
  drawingPoints,
  pendingBoundarySave,
  availablePorts,
  selectedPort,
  pendingPortPlacements,
  selectedBoundary,
  portMarkers,
  boundaries,
  boundariesCount,
  onAddBoundary,
  onCancelDrawing,
  onAddPortMode,
  onCancelAddPort,
  onPortSelect,
  onSavePortPlacements,
  onRemovePendingPort,
  onUpdatePendingPortCoordinates,
  onBoundaryNameChange,
  onConfirmBoundarySave,
  onUpdateDrawingPoint,
  onDeleteBoundary,
  onDeletePortMarker,
  onUpdatePortMarkerCoordinates
}: MapSidebarProps) => {
  const isDisabled = isDrawing || isAddingPort;

  return (
    <aside
      className={`relative flex flex-col flex-shrink-0 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 shadow-md mt-8 md:mt-0 ml-0 md:ml-4 border border-neutral-200 dark:border-neutral-700 rounded-xl h-full overflow-hidden transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16 md:w-16" : "w-full md:w-96"
      }`}
    >
      {/* Collapse Toggle Button */}
      {isCollapsed ? (
        <button
          onClick={() => !isDisabled && onToggleCollapse(!isCollapsed)}
          disabled={isDisabled}
          className={`absolute left-3.5 top-2 z-20 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md p-2 shadow-md transition-shadow ${
            isDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-lg cursor-pointer"
          }`}
          title={
            isDisabled
              ? "Cannot collapse while drawing or adding ports"
              : "Expand sidebar"
          }
        >
          <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        </button>
      ) : (
        <button
          onClick={() => !isDisabled && onToggleCollapse(!isCollapsed)}
          disabled={isDisabled}
          className={`absolute right-3.5 top-2 z-20 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md p-2 shadow-md transition-shadow ${
            isDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-lg cursor-pointer"
          }`}
          title={
            isDisabled
              ? "Cannot collapse while drawing or adding ports"
              : "Collapse sidebar"
          }
        >
          <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        </button>
      )}

      {!isCollapsed && (
        <div className="overflow-y-auto h-full">
          {/* Header Section */}
          <div className="sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 p-6 pb-4 rounded-t-xl z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                  Map Controls
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Manage boundaries and ports
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-primary-100 dark:bg-primary-900/30 rounded">
                    <PenTool className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Boundaries
                    </p>
                    <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                      {boundariesCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                    <MapPin className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Ports
                    </p>
                    <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                      {portMarkers.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 space-y-6 relative z-0">
            {/* Action Controls Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                  <PenTool className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Quick Actions
                </h3>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                <MapControls
                  isDrawing={isDrawing}
                  isAddingPort={isAddingPort}
                  drawingPoints={drawingPoints}
                  onAddBoundary={onAddBoundary}
                  onCancelDrawing={onCancelDrawing}
                  onAddPortMode={onAddPortMode}
                  onCancelAddPort={onCancelAddPort}
                />
              </div>
            </div>

            {/* Drawing Controls Section with Accordion */}
            {isDrawing && (
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={isDrawing ? "drawing-controls" : undefined}
              >
                <AccordionItem
                  value="drawing-controls"
                  className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        Boundary Drawing
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <DrawingControls
                      isDrawing={isDrawing}
                      drawingPoints={drawingPoints}
                      pendingBoundarySave={pendingBoundarySave}
                      boundaries={boundaries}
                      onBoundaryNameChange={onBoundaryNameChange}
                      onConfirmBoundarySave={onConfirmBoundarySave}
                      onCancelDrawing={onCancelDrawing}
                      onUpdateDrawingPoint={onUpdateDrawingPoint}
                      boundariesCount={boundariesCount}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* Port Controls Section */}
            {isAddingPort && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                    Port Management
                  </h3>
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                  <PortControls
                    isAddingPort={isAddingPort}
                    availablePorts={availablePorts}
                    selectedPort={selectedPort}
                    pendingPortPlacements={pendingPortPlacements}
                    boundaries={boundaries}
                    onPortSelect={onPortSelect}
                    onSavePortPlacements={onSavePortPlacements}
                    onRemovePendingPort={onRemovePendingPort}
                    onUpdatePendingPortCoordinates={
                      onUpdatePendingPortCoordinates
                    }
                    onCancelAddPort={onCancelAddPort}
                  />
                </div>
              </div>
            )}

            {/* Boundary Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-primary-100 dark:bg-primary-900/30 rounded">
                  <Info className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Boundary Details
                </h3>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                <BoundaryDetails
                  selectedBoundary={selectedBoundary}
                  portMarkers={portMarkers}
                  onDeleteBoundary={onDeleteBoundary}
                  onDeletePortMarker={onDeletePortMarker}
                  onUpdatePortMarkerCoordinates={onUpdatePortMarkerCoordinates}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="flex flex-col gap-12 justify-center items-center h-full ">
          <Layers className="w-6 h-6 rotate-90 text-neutral-600 dark:text-neutral-500 mb-2" />
          <span className="text-lg font-bold text-neutral-600 dark:text-neutral-400 rotate-90 whitespace-nowrap">
            Map Controls
          </span>
        </div>
      )}
    </aside>
  );
};
