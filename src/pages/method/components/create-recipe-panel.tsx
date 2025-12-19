import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DurationInput } from "@/components/ui/duration-input";
import { Input } from "@/components/ui/input";
import { RootState } from "@/lib/store";
import { InletWithPortId } from "@/lib/store/settings-global.slice";
import {
  mockBoundaries,
  mockPortMarkers
} from "@/pages/map-display/data/mock-data";
import { getAmbientPort } from "@/types/common/ports";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  Modifier,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  useCreateRecipeMutation,
  useGetAllStepsQuery
} from "../data/recipes.slice";

interface RecipeStep {
  id: string;
  step_id: number;
  type: string;
  name: string;
  duration: number;
  inletId?: number;
  bankId?: number;
  inletIdentifier?: number;
}

// Port interface matches Inlet structure - includes all Inlet fields
type Port = Omit<InletWithPortId, "type"> & {
  type: InletWithPortId["type"] | "ambient"; // Extend type to include ambient
  portNumber: number;
  bankNumber: number;
  enabled: boolean;
};

interface CreateRecipePanelProps {
  onBack?: () => void;
  initialData?: {
    name: string;
    version_id: number;
    steps: {
      id: string;
      step_id: number;
      type: string;
      name: string;
      duration: number;
    }[];
  };
}

const CreateRecipePanel = ({ onBack, initialData }: CreateRecipePanelProps) => {
  const [recipeName, setRecipeName] = useState(initialData?.name || "");
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>(() => {
    if (initialData?.steps) {
      return initialData.steps.map((step) => ({
        id: step.id || crypto.randomUUID(),
        step_id: step.step_id,
        type: step.type,
        name: step.name,
        duration: step.duration
      }));
    }
    return [];
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState("00:00");
  const [isEditing, setIsEditing] = useState(!!initialData);
  const [applyToAllDuration, setApplyToAllDuration] = useState(0); // Default 2 minutes
  const [durationInputErrors, setDurationInputErrors] = useState<Set<string>>(
    new Set()
  );

  const { data: apiSteps, isLoading } = useGetAllStepsQuery();
  const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();

  // Get inlets from global state (APIs are triggered at app mount)
  const globalInlets = useSelector(
    (state: RootState) => (state as any).settingsGlobal?.inlets
  );

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setRecipeName(initialData.name);
      setIsEditing(true);
    } else {
      setRecipeName("");
      setRecipeSteps([]);
      setIsEditing(false);
    }
  }, [initialData]);

  // Generate ports data from global state inlets
  // Only show enabled PORT type inlets (exclude CLEAN and REFERENCE)
  const ports = useMemo(() => {
    // If global state is empty, return empty array (APIs are being fetched)
    if (!globalInlets?.result || globalInlets.result.length === 0) {
      return [];
    }

    // Filter to only PORT type, isEnabled, and available inlets
    const enabledPortInlets = globalInlets.result.filter(
      (inlet) =>
        inlet.type === "PORT" &&
        inlet.isEnabled === true &&
        inlet.available === true
    );

    // Transform inlets to Port format - use all Inlet fields
    const regularPorts: Port[] = enabledPortInlets.map((inlet) => ({
      ...inlet, // Include all InletWithPortId fields
      portNumber: inlet.portId, // Alias for compatibility
      bankNumber: inlet.bankId, // Alias for compatibility
      enabled: inlet.isEnabled // Alias for compatibility
    }));

    // Add Ambient port (always enabled, cannot be disabled)
    // Convert ambient port to match Port interface with Inlet structure
    const ambientPortFromCommon = getAmbientPort();
    const ambientPort: Port = {
      type: "ambient",
      name: ambientPortFromCommon.name,
      bankId: 0,
      id: 0, // Ambient port has id 0
      zeroPort: false,
      isActive: true,
      available: true,
      label: ambientPortFromCommon.name,
      portId: 0,
      displayLabel: ambientPortFromCommon.name,
      isEnabled: true,
      portNumber: 0,
      bankNumber: 0,
      enabled: true
    };

    return [ambientPort, ...regularPorts];
  }, [globalInlets]);

  // Group ports by bank - manually group since we're using Inlet structure
  const portsByBank = useMemo(() => {
    const byBank: Record<number, Port[]> = {};
    ports.forEach((port) => {
      const bankKey = port.bankNumber;
      if (!byBank[bankKey]) {
        byBank[bankKey] = [];
      }
      byBank[bankKey].push(port);
    });
    return byBank;
  }, [ports]);

  // Create a mapping from port number to room name
  const portToRoomMap = useMemo(() => {
    const boundaryMap = new Map(
      mockBoundaries.map((boundary) => [boundary.id, boundary.name])
    );
    const portRoomMap = new Map<number, string>();
    mockPortMarkers.forEach((marker) => {
      const roomName = boundaryMap.get(marker.boundaryId);
      if (roomName) {
        portRoomMap.set(marker.port.portNumber, roomName);
      }
    });
    return portRoomMap;
  }, []);

  // Update total duration when recipe steps change
  useEffect(() => {
    if (recipeSteps.length === 0) {
      setTotalDuration("00:00");
    } else {
      const totalSeconds = recipeSteps.reduce(
        (total, step) => total + step.duration,
        0
      );
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setTotalDuration(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }
  }, [recipeSteps]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8
      }
    })
  );

  // Modifier to constrain dragging to vertical movement only
  const restrictToVerticalAxis: Modifier = useCallback(({ transform }) => {
    return {
      ...transform,
      x: 0 // Lock horizontal movement
    };
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveId(null);
        return;
      }

      // Only handle reordering of existing recipe steps
      const oldIndex = recipeSteps.findIndex((step) => step.id === active.id);
      const newIndex = recipeSteps.findIndex((step) => step.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setRecipeSteps((steps) => arrayMove(steps, oldIndex, newIndex));
      }

      setActiveId(null);
    },
    [recipeSteps]
  );

  const handleAddPortToRecipe = useCallback((port: Port) => {
    // Create a step based on the port with all available Inlet fields
    const newStep: RecipeStep = {
      id: `inlet-${port.id}`, // Keep string format for step id
      step_id: port.portId, // Use portId from Inlet
      type: port.type === "ambient" ? "ambient" : port.type,
      name: port.displayLabel || port.name,
      duration: 120, // Default 2 minutes (120 seconds)
      inletId: port.id,
      bankId: port.bankId,
      inletIdentifier: port.id
    };
    setRecipeSteps((prev) => [...prev, newStep]);
  }, []);

  const handleAddAllPortsToRecipe = useCallback(() => {
    // Add all ports to the recipe (all ports shown are enabled)
    const allPorts = Object.values(portsByBank).flat();
    const newSteps: RecipeStep[] = allPorts.map((port) => {
      // Use all Inlet fields from port object
      return {
        id: `inlet-${port.id}`, // Keep string format for step id
        step_id: port.portId, // Use portId from Inlet
        type: port.type === "ambient" ? "ambient" : port.type,
        name: port.displayLabel || port.name,
        duration: 120, // Default 2 minutes (120 seconds)
        inletId: port.id,
        bankId: port.bankId,
        inletIdentifier: port.id
      };
    });
    setRecipeSteps((prev) => [...prev, ...newSteps]);
    toast.success(`Added ${allPorts.length} ports to recipe`);
  }, [portsByBank]);

  const handleClearAllSteps = useCallback(() => {
    if (recipeSteps.length === 0) {
      toast.info("No steps to clear");
      return;
    }
    setRecipeSteps([]);
    setApplyToAllDuration(0);
    setDurationInputErrors(new Set());
    toast.success("All recipe steps cleared");
  }, [recipeSteps.length]);

  const handleApplyDurationToAll = useCallback(
    (duration: number) => {
      if (recipeSteps.length === 0) {
        toast.info("No steps to update");
        return;
      }
      setRecipeSteps((prev) => prev.map((step) => ({ ...step, duration })));
      toast.success(
        `Applied ${Math.floor(duration / 60)}:${(duration % 60)
          .toString()
          .padStart(2, "0")} duration to all steps`
      );
    },
    [recipeSteps.length]
  );

  const handleDurationChange = useCallback((id: string, duration: number) => {
    setRecipeSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, duration } : step))
    );
  }, []);

  const handleDurationError = useCallback((id: string, hasError: boolean) => {
    setDurationInputErrors((prev) => {
      const newSet = new Set(prev);
      if (hasError) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const handleRemoveStep = useCallback((id: string) => {
    setRecipeSteps((prev) => prev.filter((step) => step.id !== id));
    // Clear error for removed step
    setDurationInputErrors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!recipeName.trim()) {
      toast.error("Please enter a recipe name");
      return;
    }

    if (recipeSteps.length === 0) {
      toast.error("Please add at least one step to the recipe");
      return;
    }

    try {
      const totalDurationSeconds = recipeSteps.reduce(
        (total, step) => total + step.duration,
        0
      );
      const formattedSteps = recipeSteps.map((step, index) => ({
        step_id: step.step_id, // Port ID from Inlet (portId)
        step_duration: step.duration, // Duration from DurationInput component
        step_sequence: index,
        ...(step.inletId !== undefined &&
          step.bankId !== undefined &&
          step.inletIdentifier !== undefined && {
            inletId: step.inletId,
            bankId: step.bankId,
            id: step.inletIdentifier
          })
      }));

      if (isEditing) {
        // Mock update functionality
        toast.success("Recipe updated successfully");
      } else {
        await createRecipe({
          recipe_name: recipeName,
          version_id: 1, // Default version
          recipe_duration: totalDurationSeconds,
          steps: formattedSteps
        }).unwrap();
        toast.success("Recipe created successfully");
      }

      // Reset form
      setRecipeName("");
      setRecipeSteps([]);
      setIsEditing(false);

      // Close dialog if onBack is provided (dialog mode)
      if (onBack) {
        onBack();
      }
    } catch (error: unknown) {
      console.error("Error saving recipe:", error);
      let errorMessage = {
        message: "Operation failed",
        description: "Operation failed"
      };

      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as
          | string
          | { error?: { message?: string; description?: string } };

        if (typeof errorData === "object" && errorData?.error) {
          errorMessage = {
            message: errorData.error.message,
            description: errorData.error.description
          };
        } else if (typeof errorData === "string") {
          errorMessage = { message: errorData, description: errorData };
        }
      }

      toast.error(errorMessage.message, {
        description: errorMessage.description,
        duration: 5000
      });
    }
  }, [recipeName, recipeSteps, createRecipe, isEditing, onBack]);

  const PortItem = useCallback(
    ({ port }: { port: Port }) => {
      const roomName = portToRoomMap.get(port.portNumber);
      const isDisabled = !port.enabled;
      return (
        <div
          className={`p-3 border rounded-lg transition-all bg-neutral-50 dark:bg-neutral-900 ${
            isDisabled
              ? "border-neutral-300 dark:border-neutral-700 opacity-50 cursor-not-allowed"
              : "border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-sm"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                  Port #{port.portNumber}
                </div>
                {isDisabled && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                    Disabled
                  </span>
                )}
              </div>
              <div className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5 truncate">
                {port.name}
              </div>
              {roomName && (
                <div className="flex items-center gap-1.5 mt-1">
                  <svg
                    className="w-3 h-3 text-neutral-400 dark:text-neutral-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-neutral-400 dark:text-neutral-500 text-xs">
                    {roomName}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddPortToRecipe(port)}
              disabled={isDisabled}
              className="hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded-full w-8 h-8 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    },
    [handleAddPortToRecipe, portToRoomMap]
  );

  const RecipeStepItem = useCallback(
    ({
      step,
      index,
      onRemove,
      onDurationChange,
      overlay,
      onDurationError
    }: {
      step: RecipeStep;
      index: number;
      onRemove: (id: string) => void;
      onDurationChange: (id: string, duration: number) => void;
      overlay?: boolean;
      onDurationError: (id: string, hasError: boolean) => void;
    }) => {
      const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
      } = useSortable({
        id: step.id
      });

      const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        ...(overlay
          ? {
              transform: CSS.Transform.toString({
                ...transform,
                scaleX: 1.02,
                scaleY: 1.02
              }),
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              width: "600px",
              zIndex: 1000
            }
          : {})
      };

      return (
        <div
          ref={setNodeRef}
          style={style}
          className="flex items-center gap-4 shadow-sm p-2 rounded-lg ring-1 ring-neutral-200 dark:ring-neutral-700 bg-neutral-50 dark:bg-neutral-800"
        >
          <div
            {...(!overlay ? { ...attributes, ...listeners } : {})}
            className="flex justify-center items-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-move"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex justify-center items-center bg-neutral-200 dark:bg-neutral-700 rounded-full w-6 h-6 text-sm text-neutral-900 dark:text-neutral-100">
            {index + 1}
          </div>
          <div className="flex-grow min-w-0">
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              Port #{step.step_id}
            </div>
            <div className="text-neutral-500 dark:text-neutral-400 text-sm truncate">
              {step.name}
            </div>
            {portToRoomMap.get(step.step_id) && (
              <div className="flex items-center gap-1.5 mt-1">
                <svg
                  className="w-3 h-3 text-neutral-400 dark:text-neutral-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-neutral-400 dark:text-neutral-500 text-xs truncate">
                  {portToRoomMap.get(step.step_id)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DurationInput
              value={step.duration}
              onChange={(duration) => onDurationChange(step.id, duration)}
              maxSeconds={600}
              minSeconds={1}
              onError={() => onDurationError(step.id, true)}
              onSuccess={() => onDurationError(step.id, false)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(step.id)}
            className="text-neutral-400 dark:text-neutral-500 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
    [portToRoomMap]
  );

  return (
    <Card className="relative flex flex-col shadow-xl p-6 h-full overflow-auto">
      <div className="top-0 left-0 absolute -mt-px w-full overflow-hidden">
        <div className="flex h-[2px] w-full-scale-x-100">
          <div className="flex-none blur-sm w-full [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(88,186,37,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
          <div className="flex-none blur-[1px] -ml-[100%] w-full [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(88,186,37,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
        </div>
      </div>
      <div className="flex flex-shrink-0 justify-between items-center border-neutral-200 dark:border-neutral-700 border-b-2">
        <div className="flex items-center gap-1 mb-2">
          <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-base md:text-xl leading-none tracking-tight">
            {isEditing ? "Edit Recipe" : "Create New Recipe"}
          </div>

          {onBack && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onBack}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-6 h-full min-h-0">
        {/* Left Panel - Ports */}
        <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg w-1/2 overflow-y-auto">
          {/* <h2 className="mb-4 font-semibold text-lg">Available Ports</h2> */}

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Spinner />
            </div>
          ) : ports.length === 0 ? (
            <div className="flex justify-center items-center p-8 text-neutral-500 dark:text-neutral-400">
              No enabled ports available
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg text-neutral-700 dark:text-neutral-300">
                  Available Ports
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAllPortsToRecipe}
                >
                  <Plus className="w-4 h-4" />
                  Add All Ports
                </Button>
              </div>
              {Object.entries(portsByBank)
                .sort(([a], [b]) => {
                  // Sort bank 0 (Ambient) first, then others
                  if (a === "0") return -1;
                  if (b === "0") return 1;
                  return Number(a) - Number(b);
                })
                .map(([bankNumber, bankPorts]) => (
                  <div key={bankNumber} className="space-y-2">
                    <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {bankNumber === "0" ? "Special" : `Bank ${bankNumber}`}
                    </h3>
                    <div className="gap-3 grid grid-cols-2">
                      {bankPorts.map((port) => (
                        <PortItem key={port.id} port={port} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Right Panel - Recipe Steps */}
        <div className="flex flex-col bg-neutral-50 dark:bg-neutral-900 shadow-sm rounded-lg w-1/2 px-2">
          <div className="flex-1 space-y-3 pt-3 min-h-0">
            <div className="flex justify-between items-start gap-2 w-full">
              <Input
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Enter recipe name"
                className={`w-full bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 ${
                  onBack ? "" : "max-w-md"
                }`}
              />

              {!onBack && (
                <Button
                  variant="primary"
                  loading={isCreating}
                  onClick={handleSave}
                  disabled={
                    isCreating ||
                    !recipeName ||
                    recipeSteps.length === 0 ||
                    recipeSteps?.some((step) => step.duration > 3600) ||
                    durationInputErrors.size > 0
                  }
                >
                  {isCreating
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Recipe"
                    : "Create Recipe"}
                </Button>
              )}
            </div>

            {/* Action Buttons and Duration Control */}
            {recipeSteps.length > 0 && (
              <div className="flex flex-col gap-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <DurationInput
                      value={applyToAllDuration}
                      onChange={(duration) => setApplyToAllDuration(duration)}
                      onError={() =>
                        setDurationInputErrors(
                          (prev) => new Set([...prev, "apply-to-all"])
                        )
                      }
                      onSuccess={() =>
                        setDurationInputErrors((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete("apply-to-all");
                          return newSet;
                        })
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleApplyDurationToAll(applyToAllDuration)
                      }
                      disabled={
                        applyToAllDuration === 0 ||
                        durationInputErrors.has("apply-to-all")
                      }
                    >
                      Apply to All
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllSteps}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  💡 <strong>Tip:</strong> Use "Apply to All" to quickly set the
                  same duration for all recipe steps. This is useful when you
                  want consistent timing across your entire recipe.
                </div>
                {/* {durationInputErrors.size > 0 && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    ⚠️ <strong>Duration Errors:</strong> Please fix the duration
                    input errors above before creating the recipe.
                  </div>
                )} */}
              </div>
            )}

            <div className="flex flex-col flex-1 h-[calc(100vh-440px)] min-h-0 overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                  <span className="mr-1 font-medium text-neutral-900 dark:text-neutral-100">
                    {recipeSteps.length}
                  </span>
                  Recipe Steps
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Total Duration
                  <span className="ml-1 font-medium text-neutral-900 dark:text-neutral-100">
                    {totalDuration}
                  </span>
                </div>
              </div>

              <div className="p-4 border-2 border-neutral-200 dark:border-neutral-700 border-dashed rounded-lg h-full overflow-y-auto">
                {recipeSteps.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-neutral-500 dark:text-neutral-400 text-sm">
                    Add ports to begin building your recipe
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={recipeSteps.map((s) => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {recipeSteps.map((step, index) => (
                          <RecipeStepItem
                            key={step.id}
                            step={step}
                            index={index}
                            onRemove={handleRemoveStep}
                            onDurationChange={handleDurationChange}
                            onDurationError={handleDurationError}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {/* Dialog Action Buttons */}
            {onBack && (
              <div className="flex justify-end items-center gap-3  border-neutral-200 dark:border-neutral-700">
                <Button
                  variant="outline"
                  onClick={onBack}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={isCreating}
                  onClick={handleSave}
                  disabled={
                    isCreating ||
                    !recipeName ||
                    recipeSteps.length === 0 ||
                    recipeSteps?.some((step) => step.duration > 3600) ||
                    durationInputErrors.size > 0
                  }
                >
                  {isCreating
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Recipe"
                    : "Create Recipe"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreateRecipePanel;
