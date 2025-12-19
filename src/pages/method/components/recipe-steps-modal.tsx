import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Clock, Settings } from "lucide-react";
import { useState } from "react";
import { mockStepNames } from "../data/mock-recipe";
import { RecipeStep } from "../data/recipes.slice";

interface RecipeStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeName: string;
  recipeId: number;
  steps: RecipeStep[];
  onEdit?: () => void;
  readOnly?: boolean;
}

const RecipeStepsModal = ({
  isOpen,
  onClose,
  recipeName,
  recipeId,
  steps,
  onEdit,
  readOnly = true
}: RecipeStepsModalProps) => {
  const [expandedStepId, setExpandedStepId] = useState<number | null>(null);

  // Get step name by step_id
  const getStepName = (stepId: number) => {
    return mockStepNames[stepId] || `Step ${stepId}`;
  };

  // Format duration in seconds to minutes
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Sort steps by sequence
  const sortedSteps = [...steps].sort((a, b) => {
    return a.sequence - b.sequence;
  });

  // Toggle step expansion
  const toggleStepExpansion = (stepId: number) => {
    if (expandedStepId === stepId) {
      setExpandedStepId(null);
    } else {
      setExpandedStepId(stepId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Recipe Steps
            <br />
            <span className="flex items-center gap-2 text-primary-500">
              {recipeName}{" "}
              <div className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md text-neutral-500 dark:text-neutral-400 text-xs">
                ID: {recipeId}
              </div>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 my-4 pr-2 max-h-[60vh] overflow-y-auto">
          {sortedSteps.length === 0 ? (
            <div className="py-8 text-neutral-500 dark:text-neutral-400 text-center">
              This recipe has no steps defined
            </div>
          ) : (
            sortedSteps.map((step, index) => {
              const isExpanded = expandedStepId === step.step_id;

              return (
                <div
                  key={step.step_id}
                  className={`border rounded-lg p-4 transition-colors ${
                    isExpanded
                      ? "border-primary-200 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex justify-center items-center bg-neutral-100 dark:bg-neutral-800 rounded-full w-6 h-6 font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                        {step.sequence + 1}
                      </div>
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {getStepName(step.step_id)}
                      </h3>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 w-6 h-6 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                              onClick={() => toggleStepExpansion(step.step_id)}
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View step details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(step.duration)}</span>
                    </div>
                  </div>

                  <div className="gap-2 grid grid-cols-3 mt-2 text-neutral-500 dark:text-neutral-400 text-xs">
                    <div>
                      <span className="block text-neutral-400 dark:text-neutral-500">
                        Step ID
                      </span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {step.step_id}
                      </span>
                    </div>
                    <div>
                      <span className="block text-neutral-400 dark:text-neutral-500">
                        Duration
                      </span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {step.duration} seconds
                      </span>
                    </div>
                    <div>
                      <span className="block text-neutral-400 dark:text-neutral-500">
                        Sequence
                      </span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {step.sequence}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-neutral-200 dark:border-neutral-700 border-t">
                      <h4 className="mb-2 font-medium text-neutral-700 dark:text-neutral-300 text-xs">
                        Step Details
                      </h4>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        <p>
                          Port {step.step_id} - {getStepName(step.step_id)}
                        </p>
                        <p className="mt-1">
                          Duration: {formatDuration(step.duration)}
                        </p>
                        <p className="mt-1">Sequence: {step.sequence + 1}</p>
                      </div>
                    </div>
                  )}

                  {!readOnly && (
                    <div className="flex justify-end gap-1 mt-2">
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 w-7 h-7"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                      )}
                      {index < sortedSteps.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 w-7 h-7"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex justify-between items-center w-full">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Recipe
            </Button>
          )}
          <div className="flex-1"></div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeStepsModal;
