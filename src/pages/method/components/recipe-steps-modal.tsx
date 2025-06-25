import { useState, useMemo } from "react";
import { ArrowUpDown, Edit, ChevronUp, ChevronDown, Clock, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecipeStep, useGetAllStepsQuery, Step } from "@/pages/method/data/recipes.slice";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  readOnly = true,
}: RecipeStepsModalProps) => {
  const { data: allSteps, isLoading: isLoadingSteps } = useGetAllStepsQuery();
  const [expandedStepId, setExpandedStepId] = useState<number | null>(null);

  // Create a lookup map for faster step access
  const stepsMap = useMemo(() => {
    if (!allSteps) return new Map<number, Step>();
    return new Map(allSteps.map((step) => [step.step_id, step]));
  }, [allSteps]);

  // Get step by ID
  const getStep = (stepId: number): Step | undefined => {
    return stepsMap.get(stepId);
  };

  // Get step name by step_id
  const getStepName = (stepId: number) => {
    const step = getStep(stepId);
    return step?.name || `Step ${stepId}`;
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
              <div className="bg-neutral-100 px-2 py-1 rounded-md text-gray-500 text-xs">
                ID: {recipeId}
              </div>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 my-4 pr-2 max-h-[60vh] overflow-y-auto">
          {isLoadingSteps ? (
            <div className="py-8 text-gray-500 text-center">Loading step details...</div>
          ) : sortedSteps.length === 0 ? (
            <div className="py-8 text-gray-500 text-center">This recipe has no steps defined</div>
          ) : (
            sortedSteps.map((step, index) => {
              const stepDetails = getStep(step.step_id);
              const isExpanded = expandedStepId === step.recipe_step_id;

              return (
                <div
                  key={step.recipe_step_id}
                  className={`border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors ${
                    isExpanded ? "border-primary-200 bg-primary-50" : ""
                  }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex justify-center items-center bg-neutral-100 rounded-full w-6 h-6 font-medium text-black text-sm">
                        {step.sequence + 1}
                      </div>
                      <h3 className="font-medium">{getStepName(step.step_id)}</h3>

                      {stepDetails?.config && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 w-6 h-6 text-gray-400 hover:text-gray-700"
                                onClick={() => toggleStepExpansion(step.recipe_step_id)}>
                                <Settings className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View step configuration</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(step.duration)}</span>
                    </div>
                  </div>

                  <div className="gap-2 grid grid-cols-3 mt-2 text-gray-500 text-xs">
                    <div>
                      <span className="block text-gray-400">Step ID</span>
                      <span className="font-medium text-gray-700">{step.step_id}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Duration</span>
                      <span className="font-medium text-gray-700">{step.duration} seconds</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Sequence</span>
                      <span className="font-medium text-gray-700">{step.sequence}</span>
                    </div>
                  </div>

                  {isExpanded && stepDetails?.config && (
                    <div className="mt-3 pt-3 border-gray-100 border-t">
                      <h4 className="mb-2 font-medium text-gray-700 text-xs">Step Configuration</h4>
                      <div className="gap-x-4 gap-y-1 grid grid-cols-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Port 1:</span>
                          <span
                            className={
                              stepDetails.config.port_1 ? "text-primary-500" : "text-gray-400"
                            }>
                            {stepDetails.config.port_1 ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Port 2:</span>
                          <span
                            className={
                              stepDetails.config.port_2 ? "text-primary-500" : "text-gray-400"
                            }>
                            {stepDetails.config.port_2 ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Port 3:</span>
                          <span
                            className={
                              stepDetails.config.port_3 ? "text-primary-500" : "text-gray-400"
                            }>
                            {stepDetails.config.port_3 ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Port 4:</span>
                          <span
                            className={
                              stepDetails.config.port_4 ? "text-primary-500" : "text-gray-400"
                            }>
                            {stepDetails.config.port_4 ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Port 5:</span>
                          <span
                            className={
                              stepDetails.config.port_5 ? "text-primary-500" : "text-gray-400"
                            }>
                            {stepDetails.config.port_5 ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">MFC A Setpoint:</span>
                          <span className="font-medium">{stepDetails.config.mfc_A_setpoint}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">MFC B Setpoint:</span>
                          <span className="font-medium">{stepDetails.config.mfc_B_setpoint}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">MFC C Setpoint:</span>
                          <span className="font-medium">{stepDetails.config.mfc_C_setpoint}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">MFC D Setpoint:</span>
                          <span className="font-medium">{stepDetails.config.mfc_D_setpoint}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!readOnly && (
                    <div className="flex justify-end gap-1 mt-2">
                      {index > 0 && (
                        <Button variant="ghost" size="sm" className="p-0 w-7 h-7">
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                      )}
                      {index < sortedSteps.length - 1 && (
                        <Button variant="ghost" size="sm" className="p-0 w-7 h-7">
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

        {/* <DialogFooter className="flex justify-between items-center w-full">
          {" "}
          <Button variant="outline" onClick={onEdit}>
            Edit Recipe
          </Button>
          <div className="flex-1"></div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

export default RecipeStepsModal;
