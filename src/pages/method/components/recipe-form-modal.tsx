import { Spinner } from "@/components/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DurationInput } from "@/components/ui/duration-input";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  Modifier,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, GripVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCreateRecipeMutation,
  useGetAllStepsQuery,
  useUpdateRecipeMutation,
} from "../data/recipes.slice";

interface RecipeStep {
  id: string;
  step_id: number;
  type: string;
  name: string;
  duration: number;
}

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRecipeId?: number | null;
  initialData?: {
    name: string;
    version_id: number;
    steps: RecipeStep[];
  };
}

function StepItem({
  step,
  onAddToRecipe,
  overlay,
}: {
  step: { id: string; name: string; step_id: number };
  onAddToRecipe?: (stepId: number) => void;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  // For available steps with add button
  if (onAddToRecipe) {
    return (
      <div className="bg-white shadow-sm p-2 px-4 rounded-lg ring-1 ring-black/5 transition-colors">
        <div className="flex justify-between items-center">
          <span className="font-medium text-black text-sm">{step.name}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddToRecipe(step.step_id)}
            className="ml-2 px-2 py-1.5 rounded-full h-auto font-medium text-sm tracking-tight">
            <Plus className="!mr-0 !w-3 !h-3" />
            Add to Recipe
          </Button>
        </div>
      </div>
    );
  }

  // For draggable recipe steps (overlay)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    ...(overlay
      ? {
          transform: CSS.Transform.toString({
            ...transform,
            scaleX: 1.02,
            scaleY: 1.02,
          }),
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          width: "600px", // Fixed width for overlay to match recipe step width
          zIndex: 1000,
        }
      : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white hover:bg-gray-50 p-3 border border-gray-200 rounded-lg transition-colors cursor-move"
      {...(!overlay ? { ...attributes, ...listeners } : {})}>
      {step.name}
    </div>
  );
}

function RecipeStep({
  step,
  index,
  onRemove,
  onDurationChange,
  overlay,
}: {
  step: RecipeStep;
  index: number;
  onRemove: (id: string) => void;
  onDurationChange: (id: string, duration: number) => void;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    backgroundColor: isDragging ? "#eee" : "white",
    ...(overlay
      ? {
          transform: CSS.Transform.toString({
            ...transform,
            scaleX: 1.02,
            scaleY: 1.02,
          }),
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          width: "600px", // Fixed width for overlay to match recipe step width
          zIndex: 1000,
        }
      : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 bg-white shadow-sm p-2 rounded-lg ring-1 ring-black/5">
      <div
        {...(!overlay ? { ...attributes, ...listeners } : {})}
        className="flex justify-center items-center text-neutral-400 hover:text-neutral-600 cursor-move">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex justify-center items-center bg-gray-100 rounded-full w-6 h-6 text-sm">
        {index + 1}
      </div>
      <div className="flex-grow font-medium">{step.name}</div>
      <div className="flex items-center gap-2">
        <DurationInput
          value={step.duration}
          onChange={(seconds) => onDurationChange(step.id, seconds)}
          maxSeconds={3600}
          minSeconds={1}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(step.id)}
        className="text-gray-400 hover:text-red-500">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

const RecipeFormModal = ({
  isOpen,
  onClose,
  editingRecipeId,
  initialData,
}: RecipeFormModalProps) => {
  const [recipeName, setRecipeName] = useState(initialData?.name || "");
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>(initialData?.steps || []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState("00:00");
  const [versionId, setVersionId] = useState(initialData?.version_id || 0);
  const [apiError, setApiError] = useState<{
    message: string;
    description: string;
  } | null>(null);

  const { data: apiSteps, isLoading } = useGetAllStepsQuery();
  const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();
  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();

  // Update form values when initialData changes
  useEffect(() => {
    // Clear any previous errors when modal opens/closes or recipe changes
    setApiError(null);

    if (initialData && isOpen) {
      setRecipeName(initialData.name);
      setRecipeSteps(initialData.steps);
      setVersionId(initialData.version_id);
    } else if (!isOpen) {
      setRecipeName("");
      setRecipeSteps([]);
      setVersionId(0);
    }
  }, [isOpen, editingRecipeId]); // Only run when isOpen or editingRecipeId changes

  useEffect(() => {
    if (recipeSteps.length === 0) {
      setTotalDuration("00:00");
      return;
    }

    const totalSeconds = recipeSteps.reduce((total, step) => total + step.duration, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setTotalDuration(
      `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  }, [recipeSteps]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Modifier to constrain dragging to vertical movement only
  const restrictToVerticalAxis: Modifier = ({ transform }) => {
    return {
      ...transform,
      x: 0, // Lock horizontal movement
    };
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
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
  }

  function handleAddStepToRecipe(stepId: number) {
    const apiStep = apiSteps?.find((s) => s.step_id === stepId);
    if (!apiStep) return;

    const newStep: RecipeStep = {
      id: crypto.randomUUID(),
      step_id: apiStep.step_id,
      type: apiStep.name.toLowerCase(),
      name: apiStep.name,
      duration: 300, // Default 5 minutes (300 seconds)
    };
    setRecipeSteps((prev) => [...prev, newStep]);
  }

  function handleRemoveStep(id: string) {
    setRecipeSteps((prev) => prev.filter((step) => step.id !== id));
  }

  function handleDurationChange(id: string, duration: number) {
    setRecipeSteps((prev) => prev.map((step) => (step.id === id ? { ...step, duration } : step)));
  }

  const handleSave = async () => {
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
      const totalDurationSeconds = recipeSteps.reduce((total, step) => total + step.duration, 0);
      const formattedSteps = recipeSteps.map((step, index) => ({
        step_id: step.step_id,
        step_duration: step.duration,
        step_sequence: index,
      }));

      if (editingRecipeId) {
        await updateRecipe({
          recipe_row_id: editingRecipeId,
          recipe_name: recipeName,
          version_id: versionId,
          recipe_duration: totalDurationSeconds,
          steps: formattedSteps,
        }).unwrap();
        toast.success("Recipe updated successfully");
      } else {
        await createRecipe({
          recipe_name: recipeName,
          version_id: versionId,
          recipe_duration: totalDurationSeconds,
          steps: formattedSteps,
        }).unwrap();
        toast.success("Recipe created successfully");
      }

      onClose();
    } catch (error: unknown) {
      console.error("Error saving recipe:", error);
      let errorMessage = {
        message: "Operation failed",
        description: "Operation failed",
      };

      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as
          | string
          | { error?: { message?: string; description?: string } };

        if (typeof errorData === "object" && errorData?.error) {
          errorMessage = {
            message: errorData.error.message,
            description: errorData.error.description,
          };
        } else if (typeof errorData === "string") {
          errorMessage = { message: errorData, description: errorData };
        }
      }

      setApiError(errorMessage);
      toast.error(errorMessage.message);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <DialogContent className="!gap-0 bg-neutral-50 p-0 max-w-5xl">
        {/* <DialogHeader className="bg-white p-6 rounded-t-lg">
          <DialogTitle>{editingRecipeId ? "Edit Recipe" : "Create New Recipe"}</DialogTitle>
        </DialogHeader> */}

        <div className="max-h-[calc(100vh-50px)] overflow-y-auto">
          <div className="gap-8 grid grid-cols-1 md:grid-cols-6 h-full">
            <div className="col-span-1 md:col-span-2 pt-6 pl-8">
              <div className="flex items-center mb-3">
                <h3 className="font-semibold text-lg leading-none tracking-tight">
                  Available Steps
                </h3>
                {/* <div className="flex justify-center items-center bg-white shadow-sm ml-1 rounded-full ring-1 ring-black/5 size-5 text-gray-500 text-sm">
                  {apiSteps?.length}
                </div> */}
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-2">
                  {apiSteps?.map((step) => (
                    <StepItem
                      key={`step-${step.step_id}`}
                      step={{
                        id: `step-${step.step_id}`,
                        name: step.name,
                        step_id: step.step_id,
                      }}
                      onAddToRecipe={handleAddStepToRecipe}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recipe Steps */}
            <div className="col-span-1 md:col-span-4 bg-white shadow-xl p-6 pt-6 rounded-lg h-full">
              <div className="space-y-6">
                {apiError && (
                  <Alert variant="destructive">
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
                <DialogTitle>{editingRecipeId ? "Edit Recipe" : "Create New Recipe"}</DialogTitle>
                <div>
                  <label className="block mb-1 font-medium text-gray-700 text-sm">
                    Recipe Name
                  </label>
                  <Input
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-gray-500 text-sm">
                      <span className="mr-1 font-medium text-black">{recipeSteps.length}</span>
                      Recipe Steps
                    </div>
                    <div className="text-gray-500 text-sm">
                      Total Duration
                      <span className="ml-1 font-medium text-black">{totalDuration}</span>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg min-h-[calc(35vh)] max-h-[calc(100vh-200px)] overflow-y-auto">
                    {recipeSteps.length === 0 ? (
                      <div className="flex justify-center items-center h-full text-gray-500 text-sm">
                        Add steps to begin building your recipe
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}>
                        <SortableContext
                          items={recipeSteps.map((s) => s.id)}
                          strategy={verticalListSortingStrategy}>
                          <div className="space-y-2">
                            {recipeSteps.map((step, index) => (
                              <RecipeStep
                                key={step.id}
                                step={step}
                                index={index}
                                onRemove={handleRemoveStep}
                                onDurationChange={handleDurationChange}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    setApiError(null);
                  }}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={isCreating || isUpdating}
                  onClick={handleSave}
                  disabled={
                    isCreating ||
                    isUpdating ||
                    !recipeName ||
                    recipeSteps.length === 0 ||
                    recipeSteps?.some((step) => step.duration > 3600)
                  }>
                  {isCreating || isUpdating ? (
                    <>{editingRecipeId ? "Updating..." : "Creating..."}</>
                  ) : editingRecipeId ? (
                    "Update Recipe"
                  ) : (
                    "Create Recipe"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeFormModal;
