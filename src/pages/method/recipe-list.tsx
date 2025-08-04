import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateTimePicker24h } from "@/components/ui/date-time-picker-24hr";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
  AlertCircle,
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
import {
  useGetCurrentScheduleQuery,
  useScheduleCalibrationJobMutation,
  useScheduleMeasureJobMutation
} from "./data/fencelineScheduler.slice";
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

interface ServerError {
  error?: {
    name?: string;
    message?: string;
    description?: string;
  };
}

const RecipeList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<EditingRecipe | null>(
    null
  );
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);

  // Schedule modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulingRecipe, setSchedulingRecipe] = useState<MockRecipe | null>(
    null
  );
  const [jobType, setJobType] = useState<"measure" | "calibration">("measure");
  const [scheduleFormData, setScheduleFormData] = useState({
    start_dt: "",
    end_dt: "",
    frequency_unit: "days",
    frequency: 1
  });
  const [scheduleFormError, setScheduleFormError] = useState<{
    msg: string;
    desc: string;
  } | null>(null);
  const [scheduleFormSuccess, setScheduleFormSuccess] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const { data: currentSchedule } = useGetCurrentScheduleQuery();
  const [scheduleMeasureJob] = useScheduleMeasureJobMutation();
  const [scheduleCalibrationJob] = useScheduleCalibrationJobMutation();

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

  const copyIdToClipboard = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id.toString());
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
    setScheduleFormData({
      start_dt: "",
      end_dt: "",
      frequency_unit: "days",
      frequency: 1
    });
    setScheduleFormError(null);
    setScheduleFormSuccess("");
    setScheduleModalOpen(true);
  };

  const handleScheduleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "frequency") {
      setScheduleFormData({
        ...scheduleFormData,
        [name]: parseInt(value, 10) || 0
      });
    } else {
      setScheduleFormData({
        ...scheduleFormData,
        [name]: value
      });
    }
  };

  const formatDateForApi = (dateString: string): number | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleFormError(null);
    setScheduleFormSuccess("");
    setIsScheduling(true);

    if (!scheduleFormData.start_dt) {
      setScheduleFormError({
        msg: "Error",
        desc: "Start date and time is required"
      });
      setIsScheduling(false);
      return;
    }

    if (jobType === "calibration" && !scheduleFormData.end_dt) {
      setScheduleFormError({
        msg: "Error",
        desc: "End date and time is required for calibration jobs"
      });
      setIsScheduling(false);
      return;
    }

    if (jobType === "calibration" && scheduleFormData.frequency < 1) {
      setScheduleFormError({
        msg: "Error",
        desc: "Frequency must be at least 1"
      });
      setIsScheduling(false);
      return;
    }

    try {
      if (jobType === "measure") {
        const startDt = formatDateForApi(scheduleFormData.start_dt);
        if (startDt === null) {
          setScheduleFormError({
            msg: "Error",
            desc: "Invalid start date and time"
          });
          setIsScheduling(false);
          return;
        }

        const measureData = {
          start_epoch: startDt,
          recipe_row_id: schedulingRecipe?.recipe_row_id || 0
        };

        await scheduleMeasureJob(measureData).unwrap();
        toast.success("Measurement job scheduled successfully!");
        setScheduleFormSuccess("Measurement job scheduled successfully!");
        setScheduleFormError(null);
      } else {
        const startDt = formatDateForApi(scheduleFormData.start_dt);
        const endDt = formatDateForApi(scheduleFormData.end_dt);

        if (startDt === null) {
          setScheduleFormError({
            msg: "Error",
            desc: "Invalid start date and time"
          });
          setIsScheduling(false);
          return;
        }

        if (endDt === null) {
          setScheduleFormError({
            msg: "Error",
            desc: "Invalid end date and time"
          });
          setIsScheduling(false);
          return;
        }

        const calibrationData = {
          start_epoch: startDt,
          end_epoch: endDt,
          frequency_unit: scheduleFormData.frequency_unit,
          frequency: scheduleFormData.frequency,
          recipe_row_id: schedulingRecipe?.recipe_row_id || 0
        };

        await scheduleCalibrationJob(calibrationData).unwrap();
        toast.success("Calibration job scheduled successfully!");
        setScheduleFormSuccess("Calibration job scheduled successfully!");
        setScheduleFormError(null);
      }

      setScheduleModalOpen(false);
      setScheduleFormSuccess("");
      setSchedulingRecipe(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const serverData = (err as { data: unknown }).data as ServerError;
        if (serverData?.error) {
          setScheduleFormError({
            msg: serverData?.error?.message || "Error",
            desc:
              serverData?.error?.description ||
              `Failed to schedule ${jobType} job. Please try again.`
          });
        } else {
          setScheduleFormError({
            msg: "Error",
            desc: `Failed to schedule ${jobType} job. Please try again.`
          });
        }
      } else {
        setScheduleFormError({
          msg: "Error",
          desc: `Failed to schedule ${jobType} job. Please try again.`
        });
      }
      console.error(`Error scheduling ${jobType} job:`, err);
    } finally {
      setIsScheduling(false);
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

      <div className="flex-shrink-0 mb-3 pb-2 dark:border-neutral-700 border-b-2 font-semibold dark:text-white text-base md:text-xl leading-none tracking-tight">
        Recipe Library{" "}
        <span className="text-gray-500 text-base">
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
          <div className="py-8 text-gray-500 text-center">
            {searchTerm ? "No recipes match your search" : "No recipes found"}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg h-full overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <Table>
                <TableHeader className="top-0 z-10 sticky bg-gray-50">
                  <TableRow>
                    <TableHead className="w-1/5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Recipe
                    </TableHead>
                    <TableHead className="w-1/5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Duration
                    </TableHead>
                    <TableHead className="w-1/5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Steps
                    </TableHead>
                    <TableHead className="w-1/5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Schedule Status
                    </TableHead>
                    <TableHead className="w-1/5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Created
                    </TableHead>
                    <TableHead className="w-1/5 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
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
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {formatLabel(recipe.recipe_name)}
                              </div>
                              <div className="text-gray-500 text-sm">
                                ID: {recipe.recipe_row_id} • Version{" "}
                                {recipe.version_id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-gray-900 text-sm">
                            <Clock className="mr-1 w-4 h-4 text-gray-400" />

                            <Tooltip delayDuration={100}>
                              <TooltipTrigger>
                                {Math.floor(recipe.duration / 60)
                                  .toString()
                                  .padStart(2, "0")}
                                :
                                {(recipe.duration % 60)
                                  .toString()
                                  .padStart(2, "0")}
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
                          <div className="flex items-center text-gray-900 text-sm">
                            <Beaker className="mr-1 w-4 h-4 text-gray-400" />
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
                              <div className="mt-1 text-gray-500 text-xs">
                                <div>
                                  {formatDateTime(scheduleInfo.startTime)}
                                </div>
                                <div>{scheduleInfo.frequency}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full font-medium text-gray-800 text-xs">
                              Not Scheduled
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
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

      {/* Schedule Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Schedule Recipe
              <br />
              <span className="text-primary-500">
                {schedulingRecipe?.recipe_name} - {schedulingRecipe?.recipe_id}
              </span>
            </DialogTitle>
          </DialogHeader>
          {schedulingRecipe?.duration < 0 && (
            <Alert variant="default">
              <AlertTitle>Recipe Duration</AlertTitle>
              <AlertDescription>
                This recipe has a duration of less than 0 minute.
              </AlertDescription>
            </Alert>
          )}

          {scheduleFormError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4 text-white" />
              <AlertTitle>{scheduleFormError.msg}</AlertTitle>
              <AlertDescription>{scheduleFormError.desc}</AlertDescription>
            </Alert>
          )}
          {scheduleFormSuccess && (
            <div className="bg-green-50 mb-4 p-2 rounded-md text-green-600 text-sm">
              {scheduleFormSuccess}
            </div>
          )}
          <form onSubmit={handleScheduleSubmit}>
            <div className="gap-5 grid grid-cols-1 mt-1 mb-5">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="job-type">Job Type</Label>
                <Select
                  value={jobType}
                  onValueChange={(value) =>
                    setJobType(value as "measure" | "calibration")
                  }
                >
                  <SelectTrigger id="job-type">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="measure">Measurement</SelectItem>
                    <SelectItem value="calibration">Calibration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="start-date">Start Date and Time</Label>
                <DateTimePicker24h
                  id="start-date"
                  type="datetime-local"
                  name="start_dt"
                  value={scheduleFormData.start_dt}
                  onChange={handleScheduleInputChange}
                  futureOnly={true}
                  required
                />
              </div>

              {jobType === "calibration" && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="end-date">End Date and Time</Label>
                    <DateTimePicker24h
                      id="end-date"
                      type="datetime-local"
                      name="end_dt"
                      value={scheduleFormData.end_dt}
                      onChange={handleScheduleInputChange}
                      futureOnly={true}
                      required
                    />
                  </div>

                  <div className="gap-3 grid grid-cols-2">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        type="number"
                        name="frequency"
                        value={scheduleFormData.frequency}
                        onChange={handleScheduleInputChange}
                        min="1"
                        required
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="frequency-unit">Unit</Label>
                      <Select
                        name="frequency_unit"
                        value={scheduleFormData.frequency_unit}
                        onValueChange={(value) =>
                          setScheduleFormData({
                            ...scheduleFormData,
                            frequency_unit: value
                          })
                        }
                      >
                        <SelectTrigger id="frequency-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setScheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isScheduling}
                className="flex-1"
                loading={isScheduling}
              >
                {`Schedule ${
                  jobType === "measure" ? "Measurement" : "Calibration"
                }`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RecipeList;
