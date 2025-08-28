import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetSmartRecipeConfigQuery,
  useUpdateSmartRecipeConfigMutation
} from "../data/smart-recipe.slice";

export const SmartRecipeTab = () => {
  const { data: configData, isLoading } = useGetSmartRecipeConfigQuery();
  const [updateConfig, { isLoading: isUpdating }] =
    useUpdateSmartRecipeConfigMutation();

  const [enabled, setEnabled] = useState(false);
  const [iterationCount, setIterationCount] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with API data
  useEffect(() => {
    if (configData?.data) {
      setEnabled(configData.data.enabled);
      setIterationCount(configData.data.iteration_count);
      setHasChanges(false);
    }
  }, [configData]);

  // Track changes
  useEffect(() => {
    if (configData?.data) {
      const hasChanges =
        enabled !== configData.data.enabled ||
        iterationCount !== configData.data.iteration_count;
      setHasChanges(hasChanges);
    }
  }, [enabled, iterationCount, configData]);

  const handleSave = async () => {
    try {
      await updateConfig({
        enabled,
        iteration_count: iterationCount
      }).unwrap();

      toast.success("Smart recipe configuration updated successfully");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to update smart recipe configuration");
      console.error("Update error:", error);
    }
  };

  const handleReset = () => {
    if (configData?.data) {
      setEnabled(configData.data.enabled);
      setIterationCount(configData.data.iteration_count);
      setHasChanges(false);
    }
  };

  const handleIterationCountChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setIterationCount(numValue);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-neutral-500">
          Loading smart recipe configuration...
        </div>
      </div>
    );
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="mb-2 text-lg">
              Smart Recipe Configuration
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Configure smart recipe settings for automated recipe optimization.
            </p>
          </div>

          {/* Action Buttons - Positioned at top-right like other tabs */}
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isUpdating}
              >
                Reset
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSave}
                disabled={isUpdating}
                loading={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Enable/Disable Smart Recipe */}
        <div className="space-y-4 max-w-md">
          <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div>
                <Label className="font-medium text-neutral-700 dark:text-neutral-300 text-sm">
                  Enable Smart Recipe
                </Label>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                  Automatically optimize recipes based on performance data
                </p>
              </div>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        {/* Iteration Count */}
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label
              className={`font-medium text-sm ${
                !enabled
                  ? "text-neutral-400"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            >
              Iteration Count
            </Label>
            <Input
              type="number"
              min="1"
              value={iterationCount}
              onChange={(e) => handleIterationCountChange(e.target.value)}
              disabled={!enabled}
              className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter iteration count"
            />
            <p
              className={`text-xs ${
                !enabled
                  ? "text-neutral-400"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {!enabled
                ? "Enable Smart Recipe to configure iteration count"
                : "Number of times to repeat current step for Smart Recipe actions"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
