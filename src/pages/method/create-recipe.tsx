import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, Loader2, AlertCircle } from "lucide-react";
import {
  useGetAllStepsQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  Step as ApiStep,
} from "./data/recipes.slice";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RecipeStep {
  id: string;
  step_id: number;
  type: string;
  name: string;
  duration: number; // in seconds
}

function StepItem({
  step,
  overlay,
}: {
  step: { id: string; name: string; step_id: number };
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    ...(overlay
      ? {
          transform: CSS.Transform.toString({ ...transform, scaleX: 1.05, scaleY: 1.05 }),
          boxShadow: "0 0 12px rgba(0,0,0,0.12)",
        }
      : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 border border-gray-200 rounded-lg bg-white cursor-move hover:bg-gray-50 transition-colors"
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
    opacity: isDragging ? 0.3 : 1,
    ...(overlay
      ? {
          transform: CSS.Transform.toString({ ...transform, scaleX: 1.05, scaleY: 1.05 }),
          boxShadow: "0 0 12px rgba(0,0,0,0.12)",
        }
      : {}),
  };

  // Convert seconds to minutes for display
  const durationMinutes = step.duration / 60;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-white">
      <div
        {...(!overlay ? { ...attributes, ...listeners } : {})}
        className="flex items-center justify-center cursor-move hover:text-neutral-600 text-neutral-400">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-sm">
        {index + 1}
      </div>
      <div className="flex-grow font-medium">{step.name}</div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={durationMinutes}
          onChange={(e) => {
            const minutes = parseFloat(e.target.value);
            if (!isNaN(minutes) && minutes >= 0) {
              onDurationChange(step.id, minutes * 60); // Convert minutes to seconds
            }
          }}
          className="w-20"
        />
        <span className="text-sm text-gray-500">min</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(step.id)}
        className="text-gray-400 hover:text-red-500">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

const CreateRecipePage = () => {
  const [recipeName, setRecipeName] = useState("");
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState("00:00");
  const [versionId, setVersionId] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);

  // Fetch steps from API
  const { data: apiSteps, isLoading, error } = useGetAllStepsQuery();
  const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();
  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();
  const [deleteRecipe, { isLoading: isDeleting }] = useDeleteRecipeMutation();

  // Calculate total duration whenever steps change
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

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // Check if we're dragging a new step from the available steps
    const draggedAvailableStep = apiSteps?.find((s) => `step-${s.step_id}` === active.id);

    if (draggedAvailableStep) {
      // Add new step
      const newStep: RecipeStep = {
        id: crypto.randomUUID(),
        step_id: draggedAvailableStep.step_id,
        type: draggedAvailableStep.name.toLowerCase(),
        name: draggedAvailableStep.name,
        duration: 300, // Default 5 minutes (300 seconds)
      };
      setRecipeSteps((prev) => [...prev, newStep]);
    } else {
      // Reorder existing steps
      const oldIndex = recipeSteps.findIndex((step) => step.id === active.id);
      const newIndex = recipeSteps.findIndex((step) => step.id === over.id);

      if (oldIndex !== newIndex) {
        setRecipeSteps((steps) => arrayMove(steps, oldIndex, newIndex));
      }
    }

    setActiveId(null);
  }

  function handleRemoveStep(id: string) {
    setRecipeSteps((prev) => prev.filter((step) => step.id !== id));
  }

  function handleDurationChange(id: string, duration: number) {
    setRecipeSteps((prev) => prev.map((step) => (step.id === id ? { ...step, duration } : step)));
  }

  const handleCreateRecipe = async () => {
    // Clear any previous errors
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
      // Calculate total duration in seconds
      const totalDurationSeconds = recipeSteps.reduce((total, step) => total + step.duration, 0);

      // Format steps for API
      const formattedSteps = recipeSteps.map((step, index) => ({
        step_id: step.step_id,
        step_duration: step.duration,
        step_sequence: index,
      }));

      const response = await createRecipe({
        recipe_name: recipeName,
        version_id: versionId,
        recipe_duration: totalDurationSeconds,
        steps: formattedSteps,
      }).unwrap();

      console.log("response", response);

      toast.success("Recipe created successfully");

      // Reset form
      setRecipeName("");
      setRecipeSteps([]);
      setVersionId(0);
    } catch (error: unknown) {
      console.error("Error creating recipe:", error);

      // Extract error message from API response
      let errorMessage = "Failed to create recipe";

      // Type guard to check if error has expected structure
      if (error && typeof error === "object" && "data" in error) {
        // Define a type for the expected error structure
        type ApiErrorResponse = {
          error?: {
            message?: string;
            description?: string;
            name?: string;
          };
        };

        const errorData = error.data as string | ApiErrorResponse | undefined;

        if (typeof errorData === "object" && errorData?.error) {
          if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error.description) {
            errorMessage = errorData.error.description;
          }
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }

        // Log the full error data for debugging
        console.error("Full error data:", errorData);
      }

      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleUpdateRecipe = async () => {
    if (!editingRecipeId) {
      toast.error("No recipe selected for update");
      return;
    }

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

      await updateRecipe({
        recipe_row_id: editingRecipeId,
        recipe_name: recipeName,
        version_id: versionId,
        recipe_duration: totalDurationSeconds,
        steps: formattedSteps,
      }).unwrap();

      toast.success("Recipe updated successfully");
      resetForm();
    } catch (error: unknown) {
      console.error("Error updating recipe:", error);
      handleApiError(error);
    }
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    try {
      await deleteRecipe({
        id: recipeId,
        name: recipeName,
      }).unwrap();
      toast.success("Recipe deleted successfully");
      resetForm();
    } catch (error: unknown) {
      console.error("Error deleting recipe:", error);
      handleApiError(error);
    }
  };

  const resetForm = () => {
    setRecipeName("");
    setRecipeSteps([]);
    setVersionId(0);
    setEditingRecipeId(null);
  };

  const handleApiError = (error: unknown) => {
    let errorMessage = "Operation failed";

    if (error && typeof error === "object" && "data" in error) {
      const errorData = error.data as
        | string
        | { error?: { message?: string; description?: string } };

      if (typeof errorData === "object" && errorData?.error) {
        errorMessage = errorData.error.message || errorData.error.description || errorMessage;
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      }

      console.error("Full error data:", errorData);
    }

    setApiError(errorMessage);
    toast.error(errorMessage);
  };

  // Find the active step
  const activeStep = activeId
    ? apiSteps?.find((s) => `step-${s.step_id}` === activeId) ||
      recipeSteps.find((s) => s.id === activeId)
    : null;

  return (
    <>
      <main className="max-w-8xl mx-auto py-8 h-full overflow-y-auto w-full px-8 md:px-12">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Available Steps */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-gray-800 font-semibold tracking-tight text-xl mb-4">Steps</h2>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-lg">
                  Failed to load steps. Please try again.
                </div>
              ) : (
                <div className="space-y-2">
                  <SortableContext
                    items={apiSteps?.map((s) => `step-${s.step_id}`) || []}
                    strategy={verticalListSortingStrategy}>
                    {apiSteps?.map((step) => (
                      <StepItem
                        key={`step-${step.step_id}`}
                        step={{
                          id: `step-${step.step_id}`,
                          name: step.name,
                          step_id: step.step_id,
                        }}
                      />
                    ))}
                  </SortableContext>
                </div>
              )}
            </div>

            {/* Recipe Steps */}
            <div className="col-span-1 md:col-span-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-gray-800 font-semibold tracking-tight text-xl">
                  Recipe Details
                </h2>
                <div className="flex gap-2">
                  {editingRecipeId ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => resetForm()}
                        disabled={isUpdating}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleUpdateRecipe}
                        disabled={isUpdating || !recipeName || recipeSteps.length === 0}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Recipe"
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCreateRecipe}
                      disabled={isCreating || !recipeName || recipeSteps.length === 0}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Recipe"
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {apiError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Recipe Name
                  </label>
                  <Input
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="My Recipe #7"
                    className="max-w-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Version ID</label>
                  <Input
                    type="number"
                    value={versionId}
                    onChange={(e) => setVersionId(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="max-w-md"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Steps</label>
                    <div className="text-sm text-gray-500">
                      Total Duration: <span className="font-medium">{totalDuration}</span>
                    </div>
                  </div>

                  <div className="min-h-[300px] border-2 border-dashed border-gray-200 rounded-lg p-4">
                    {recipeSteps.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        Drag steps here to build your recipe
                      </div>
                    ) : (
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeId &&
              activeStep &&
              (apiSteps?.find((s) => `step-${s.step_id}` === activeId) ? (
                <StepItem
                  step={{
                    id: activeId,
                    name: (activeStep as ApiStep).name,
                    step_id: (activeStep as ApiStep).step_id,
                  }}
                  overlay
                />
              ) : (
                <RecipeStep
                  step={activeStep as RecipeStep}
                  index={recipeSteps.findIndex((s) => s.id === activeId)}
                  onRemove={() => {}}
                  onDurationChange={() => {}}
                  overlay
                />
              ))}
          </DragOverlay>
        </DndContext>
      </main>
    </>
  );
};

export default CreateRecipePage;
