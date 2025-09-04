import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { formatDateTime, formatLabel } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Beaker,
  Clock,
  List,
  MoreVertical,
  Pencil,
  PlayCircle,
  Plus,
  Repeat,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CreateRecipePanel from "./components/create-recipe-panel";
import DeleteRecipeModal from "./components/delete-recipe-modal";
import RecipeStepsModal from "./components/recipe-steps-modal";
import { useGetCurrentScheduleQuery } from "./data/fencelineScheduler.slice";
import { MockRecipe, mockRecipes, mockStepNames } from "./data/mock-recipe";

interface EditingRecipe {
  id: number;
  name: string;
  version_id: number;
  steps: {
    id: string;
    step_id: number;
    type: string;
    name: string;
    duration: number;
  }[];
}

const RecipeList = () => {
  // Helper function to format duration from seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<EditingRecipe | null>(
    null
  );
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);

  // Schedule confirmation modal state
  const [scheduleConfirmModalOpen, setScheduleConfirmModalOpen] =
    useState(false);
  const [schedulingRecipe, setSchedulingRecipe] = useState<MockRecipe | null>(
    null
  );

  const { data: currentSchedule } = useGetCurrentScheduleQuery();

  // Use mock data instead of API
  const recipes = mockRecipes;

  const filteredRecipes = recipes
    ?.filter((recipe) =>
      recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((recipe) => recipe.duration > 0);

  const selectedRecipeData = recipes?.find(
    (r) => r.recipe_row_id === selectedRecipe
  );

  const getStepName = (stepId: number) => {
    return mockStepNames[stepId] || `Step ${stepId}`;
  };

  const handleEditRecipe = (recipe: MockRecipe) => {
    setEditingRecipe({
      id: recipe.recipe_row_id,
      name: recipe.recipe_name,
      version_id: recipe.version_id,
      steps:
        recipe.steps?.map((step) => ({
          id: crypto.randomUUID(),
          step_id: step.step_id,
          type: "regular", // Default to regular type
          name: getStepName(step.step_id),
          duration: step.duration
        })) || []
    });
    setShowCreateRecipe(true);
  };

  const handleDeleteRecipe = (recipe: MockRecipe) => {
    setSelectedRecipe(recipe.recipe_row_id);
    setDeleteModalOpen(true);
  };

  const handleViewSteps = (e: React.MouseEvent, recipeId: number) => {
    e.stopPropagation();
    setSelectedRecipe(recipeId);
    setStepsModalOpen(true);
  };

  const handleCreateRecipe = () => {
    setEditingRecipe(null);
    setShowCreateRecipe(true);
  };

  const handleBackToRecipes = () => {
    setShowCreateRecipe(false);
    setEditingRecipe(null);
  };

  const handleScheduleRecipe = (recipe: MockRecipe) => {
    setSchedulingRecipe(recipe);
    setScheduleConfirmModalOpen(true);
  };

  const handleScheduleConfirm = () => {
    if (schedulingRecipe) {
      // TODO: Replace this with actual API call in the future
      // This handler contains all the recipe information you need:
      const recipeInfo = {
        recipe_row_id: schedulingRecipe.recipe_row_id,
        recipe_id: schedulingRecipe.recipe_id,
        recipe_name: schedulingRecipe.recipe_name,
        version_id: schedulingRecipe.version_id,
        duration: schedulingRecipe.duration,
        steps: schedulingRecipe.steps,
        created_at: schedulingRecipe.created_at
        // Add any other fields you need for the API
      };

      console.log("Recipe scheduled with info:", recipeInfo);

      // Show success toast
      toast.success(
        `Recipe "${schedulingRecipe.recipe_name}" started successfully!`
      );

      // Close modal and reset state
      setScheduleConfirmModalOpen(false);
      setSchedulingRecipe(null);
    }
  };

  const getRecipeScheduleInfo = (recipeId: number) => {
    if (!currentSchedule) return null;

    const calibrationJob = currentSchedule.find(
      (job) =>
        job.job_type === "calibration" &&
        "recipe" in job &&
        job.recipe === recipeId
    );

    if (
      calibrationJob &&
      "frequency_unit" in calibrationJob &&
      "frequency_amount" in calibrationJob
    ) {
      return {
        type: "calibration" as const,
        startTime: new Date(calibrationJob.start_epoch * 1000),
        frequency: `Every ${calibrationJob.frequency_amount} ${calibrationJob.frequency_unit}`,
        scheduleId: calibrationJob.schedule_id
      };
    }

    const measurementJob = currentSchedule.find(
      (job) =>
        job.job_type === "measure" &&
        "recipe_row_id" in job &&
        job.recipe_row_id === recipeId
    );

    if (measurementJob) {
      return {
        type: "measurement" as const,
        startTime: new Date(measurementJob.start_epoch * 1000),
        frequency: " ",
        scheduleId: null
      };
    }

    return null;
  };

  if (showCreateRecipe) {
    return (
      <div className="h-full">
        <CreateRecipePanel
          onBack={handleBackToRecipes}
          initialData={
            editingRecipe
              ? {
                  name: editingRecipe.name,
                  version_id: editingRecipe.version_id,
                  steps: editingRecipe.steps
                }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <Card className="relative flex flex-col shadow-xl p-6 overflow-hidden">
      <div className="top-0 left-0 absolute -mt-px w-full overflow-hidden">
        <div className="flex h-[2px] w-full-scale-x-100">
          <div className="flex-none blur-sm w-full [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(88,186,37,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
          <div className="flex-none blur-[1px] -ml-[100%] w-full [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(88,186,37,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
        </div>
      </div>

      <div className="flex-shrink-0 mb-3 pb-2 border-neutral-200 dark:border-neutral-700 border-b-2 font-semibold text-neutral-900 dark:text-neutral-100 text-base md:text-xl leading-none tracking-tight">
        Recipe Library{" "}
        <span className="text-neutral-500 dark:text-neutral-400 text-base">
          ({filteredRecipes.length})
        </span>
      </div>

      <div className="flex flex-shrink-0 justify-between items-center mb-4">
        <div className="flex gap-2 w-full">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            />
          </div>
          <Button
            onClick={handleCreateRecipe}
            className="bg-primary-500 hover:bg-primary-600"
          >
            Create Recipe
          </Button>
        </div>
      </div>

      <div className="py-4 h-[calc(100vh-300px)] overflow-auto">
        {filteredRecipes?.length === 0 ? (
          <div className="py-8 text-neutral-500 dark:text-neutral-400 text-center">
            {searchTerm ? "No recipes match your search" : "No recipes found"}
          </div>
        ) : (
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg h-full overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-neutral-100 dark:scrollbar-track-neutral-800">
              <Table>
                <TableHeader className="top-0 z-10 sticky bg-neutral-100 dark:bg-neutral-800">
                  <TableRow>
                    <TableHead className="w-1/5 font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                      Recipe
                    </TableHead>
                    <TableHead className="w-1/5 font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                      Duration
                    </TableHead>
                    <TableHead className="w-1/5 font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                      Steps
                    </TableHead>
                    <TableHead className="w-1/5 font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                      Schedule Status
                    </TableHead>
                    <TableHead className="w-1/5 font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                      Created
                    </TableHead>
                    <TableHead className="w-1/5 font-medium text-neutral-500 dark:text-neutral-400 text-xs text-right uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipes.map((recipe) => {
                    const scheduleInfo = getRecipeScheduleInfo(
                      recipe.recipe_row_id
                    );

                    return (
                      <TableRow
                        key={recipe.recipe_row_id}
                        className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                                {formatLabel(recipe.recipe_name)}
                              </div>
                              <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                                ID: {recipe.recipe_row_id} • Version{" "}
                                {recipe.version_id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-neutral-900 dark:text-neutral-100 text-sm">
                            <Clock className="mr-1 w-4 h-4 text-neutral-400 dark:text-neutral-500" />

                            <Tooltip delayDuration={100}>
                              <TooltipTrigger>
                                {formatDuration(recipe.duration)}
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="shadow-xl p-2 border-none rounded-lg text-xs"
                              >
                                {recipe.duration} seconds
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-neutral-900 dark:text-neutral-100 text-sm">
                            <Beaker className="mr-1 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                            {recipe.steps?.length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {scheduleInfo ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                {scheduleInfo.type === "calibration" ? (
                                  <Repeat className="size-3 text-primary-500" />
                                ) : (
                                  <PlayCircle className="size-3 text-primary-500" />
                                )}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full ring-1 ring-primary-500 font-medium text-primary-500 text-xs">
                                  {scheduleInfo.type === "calibration"
                                    ? "Calibration"
                                    : "Measurement"}
                                </span>
                              </div>
                              <div className="mt-1 text-neutral-500 dark:text-neutral-400 text-xs">
                                <div>
                                  {formatDateTime(scheduleInfo.startTime)}
                                </div>
                                <div>{scheduleInfo.frequency}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-full font-medium text-neutral-800 dark:text-neutral-200 text-xs">
                              Not Scheduled
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-neutral-700 dark:text-neutral-300">
                          {recipe.created_at
                            ? formatDistanceToNow(
                                new Date(recipe.created_at * 1000),
                                {
                                  addSuffix: true
                                }
                              )
                            : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) =>
                                handleViewSteps(e, recipe.recipe_row_id)
                              }
                              className="text-xs"
                            >
                              <List className="!mr-0 !size-3" />
                              View Steps
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleScheduleRecipe(recipe)}
                              className="text-xs"
                            >
                              <Plus className="!mr-0 !size-3" />
                              Schedule
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 w-8 h-8"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditRecipe(recipe)}
                                  className="min-w-40"
                                >
                                  <Pencil className="opacity-50 mr-1 w-4 h-4" />
                                  Edit Recipe
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteRecipe(recipe)}
                                  className="min-w-40 text-red-600"
                                >
                                  <Trash2 className="mr-1 w-4 h-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {selectedRecipeData && (
        <RecipeStepsModal
          isOpen={stepsModalOpen}
          onClose={() => {
            setStepsModalOpen(false);
            setSelectedRecipe(null);
          }}
          recipeName={selectedRecipeData.recipe_name}
          recipeId={selectedRecipeData.recipe_row_id}
          steps={selectedRecipeData.steps || []}
          onEdit={() => {
            setStepsModalOpen(false);
            handleEditRecipe(selectedRecipeData);
          }}
        />
      )}

      {selectedRecipeData && (
        <DeleteRecipeModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedRecipe(null);
          }}
          recipeName={selectedRecipeData.recipe_name}
          recipeId={selectedRecipeData.recipe_row_id}
        />
      )}

      {/* Schedule Confirmation Modal */}
      <Dialog
        open={scheduleConfirmModalOpen}
        onOpenChange={setScheduleConfirmModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Confirm Recipe Schedule
            </DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4">
            <div className="text-neutral-600 dark:text-neutral-400">
              <p className="mb-2">
                <strong>{schedulingRecipe?.recipe_name}</strong> will run
                indefinitely until manually interrupted.
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Recipe ID: {schedulingRecipe?.recipe_id} • Duration:{" "}
                {formatDuration(schedulingRecipe?.duration || 0)}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setScheduleConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={handleScheduleConfirm}
              >
                Confirm & Start
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RecipeList;
