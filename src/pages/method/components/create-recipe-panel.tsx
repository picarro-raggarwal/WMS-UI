import { Spinner } from "@/components/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DurationInput } from "@/components/ui/duration-input";
import { Input } from "@/components/ui/input";
import { generateAllPorts, getPortsByBank } from "@/types/common/ports";
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
import {
  AlertCircle,
  ArrowLeft,
  GripVertical,
  Plus,
  Trash2
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
}

interface Port {
  id: string;
  portNumber: number;
  name: string;
  type: "regular";
  bankNumber: number;
}

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
  const [apiError, setApiError] = useState<{
    message: string;
    description: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(!!initialData);
  const [applyToAllDuration, setApplyToAllDuration] = useState(0); // Default 2 minutes
  const [durationInputErrors, setDurationInputErrors] = useState<Set<string>>(
    new Set()
  );

  const { data: apiSteps, isLoading } = useGetAllStepsQuery();
  const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();

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

  // Generate ports data using common configuration
  const ports = useMemo(() => generateAllPorts(), []);

  const portsByBank = useMemo(() => getPortsByBank(ports), [ports]);

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
    // Create a step based on the port
    const newStep: RecipeStep = {
      id: crypto.randomUUID(),
      step_id: port.portNumber,
      type: port.type,
      name: port.name,
      duration: 120 // Default 2 minutes (120 seconds)
    };
    setRecipeSteps((prev) => [...prev, newStep]);
  }, []);

  const handleAddAllPortsToRecipe = useCallback(() => {
    // Add all available ports to the recipe
    const allPorts = Object.values(portsByBank).flat();
    const newSteps: RecipeStep[] = allPorts.map((port) => ({
      id: crypto.randomUUID(),
      step_id: port.portNumber,
      type: port.type,
      name: port.name,
      duration: 120 // Default 2 minutes (120 seconds)
    }));
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
    setApiError(null);

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
        step_id: step.step_id,
        step_duration: step.duration,
        step_sequence: index
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
      setApiError(null);
      setIsEditing(false);
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

      setApiError(errorMessage);
      toast.error(errorMessage.message);
    }
  }, [recipeName, recipeSteps, createRecipe, isEditing]);

  const PortItem = useCallback(
    ({ port }: { port: Port }) => {
      return (
        <div className="p-3 border border-gray-200 rounded-lg transition-colors bg-white hover:border-gray-300">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">
                Port #{port.portNumber}
              </div>
              <div className="text-gray-500 text-xs">{port.name}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddPortToRecipe(port)}
              className="hover:bg-gray-100 p-1 rounded-full w-8 h-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    },
    [handleAddPortToRecipe]
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
          className="flex items-center gap-4 shadow-sm p-2 rounded-lg ring-1 ring-black/5 bg-white"
        >
          <div
            {...(!overlay ? { ...attributes, ...listeners } : {})}
            className="flex justify-center items-center text-neutral-400 hover:text-neutral-600 cursor-move"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex justify-center items-center bg-gray-100 rounded-full w-6 h-6 text-sm">
            {index + 1}
          </div>
          <div className="flex-grow">
            <div className="font-medium text-gray-900">
              Port #{step.step_id}
            </div>
            <div className="text-gray-500 text-sm">{step.name}</div>
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
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
    []
  );

  return (
    <Card className="relative flex flex-col shadow-xl p-6 h-[calc(100vh-150px)] overflow-auto">
      <div className="top-0 left-0 absolute -mt-px w-full overflow-hidden">
        <div className="flex h-[2px] w-full-scale-x-100">
          <div className="flex-none blur-sm w-full [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(88,186,37,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
          <div className="flex-none blur-[1px] -ml-[100%] w-full [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(88,186,37,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
        </div>
      </div>
      <div className="flex flex-shrink-0 justify-between items-center dark:border-neutral-700 border-b-2">
        <div className="flex items-center gap-1 mb-2">
          <div className="font-semibold dark:text-white text-base md:text-xl leading-none tracking-tight">
            {isEditing ? "Edit Recipe" : "Create New Recipe"}
          </div>

          {onBack && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {apiError && (
        <Alert variant="destructive" className="flex-shrink-0 mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col gap-1">
              <span>{apiError.message}</span>
              <span>{apiError.description}</span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-1 gap-6 h-full min-h-0">
        {/* Left Panel - Ports */}
        <div className="bg-gray-50 p-3 rounded-lg w-1/2 overflow-y-auto">
          {/* <h2 className="mb-4 font-semibold text-lg">Available Ports</h2> */}

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg text-gray-700">
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
              {Object.entries(portsByBank).map(([bankNumber, bankPorts]) => (
                <div key={bankNumber} className="space-y-2">
                  <h3 className="font-semibold text-gray-700">
                    Bank {bankNumber}
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
        <div className="flex flex-col bg-white shadow-sm rounded-lg w-1/2">
          <div className="flex-1 space-y-3 pt-3 min-h-0">
            <div className="flex justify-between items-start gap-2 w-full">
              <Input
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Enter recipe name"
                className="w-full max-w-md"
              />

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

            {/* Action Buttons and Duration Control */}
            {recipeSteps.length > 0 && (
              <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg border">
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
                <div className="text-xs text-gray-500">
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

            <div className="flex flex-col flex-1 h-[calc(100vh-420px)] min-h-0 overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-500 text-sm">
                  <span className="mr-1 font-medium text-black">
                    {recipeSteps.length}
                  </span>
                  Recipe Steps
                </div>
                <div className="text-gray-500 text-sm">
                  Total Duration
                  <span className="ml-1 font-medium text-black">
                    {totalDuration}
                  </span>
                </div>
              </div>

              <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg h-full overflow-y-auto">
                {recipeSteps.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500 text-sm">
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
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreateRecipePanel;
