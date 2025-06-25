import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatLabel } from "@/utils";
import { AlertTriangle, LocateFixed } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetHardwareSettingsQuery,
  useSetHardwareSettingsMutation,
} from "../data/settings.slice";

export const GeneralTab = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [hardwareSettingsValue, setHardwareSettingsValue] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [
    setHardwareSettings,
    { isLoading: isHardwareSettingsSaving, isError: isErrorhardwareSettings },
  ] = useSetHardwareSettingsMutation();

  const { data: hardwareSettings, isError: isErrorGettingHardwareSettings } =
    useGetHardwareSettingsQuery();

  useEffect(() => {
    if (hardwareSettings) {
      setHardwareSettingsValue(
        hardwareSettings?.data?.hardware?.anemometer?.anemometer_gps_calibration_offset || 0
      );
    }
  }, [hardwareSettings, isErrorhardwareSettings]);

  const handleSaveHardwareSettings = async () => {
    try {
      await setHardwareSettings({
        settings: {
          hardware: {
            anemometer: {
              anemometer_gps_calibration_offset: hardwareSettingsValue,
            },
          },
        },
      }).unwrap();

      toast.success(`Value updated for ${formatLabel("anemometer_gps_calibration_offset")}`);
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save compass offset";
      setErrors({ ["anemometer_gps_calibration_offset"]: errorMessage });
    }
  };

  const hasError = errors["anemometer_gps_calibration_offset"];

  return (
    <div className="space-y-6">
      <Card className="space-y-6 p-6">
        <div className="mb-6">
          <CardTitle className="mb-2 text-lg">General Settings</CardTitle>
          <p className="text-muted-foreground text-sm">
            Configure the general settings for the system.
          </p>
        </div>
        <div className="space-y-8">
          <div className="bg-white dark:bg-neutral-900 p-6 border dark:border-neutral-700/50 rounded-lg">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="font-semibold text-base">Anemometer Compass Offset</div>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setHardwareSettingsValue(
                          hardwareSettings?.data?.hardware?.anemometer
                            ?.anemometer_gps_calibration_offset || 0
                        );
                        setErrors({});
                      }}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      loading={isHardwareSettingsSaving}
                      disabled={isHardwareSettingsSaving}
                      onClick={handleSaveHardwareSettings}>
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    disabled={isErrorGettingHardwareSettings}>
                    {hardwareSettingsValue ? "Edit" : "Configure offset"}
                  </Button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-4 mb-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-black text-sm">
                    Anemometer Compass Offset Value
                  </label>
                  <Input
                    type="number"
                    value={hardwareSettingsValue}
                    onChange={(e) => setHardwareSettingsValue(Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    className="w-full"
                    step="0.1"
                    placeholder={`Enter offset value`}
                    min={0}
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-4 mb-4">
                {hardwareSettingsValue ? (
                  <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 shadow-sm px-3 py-2 border dark:border-neutral-700/50 rounded-full">
                    <LocateFixed size={14} className="text-neutral-600 shrink-0" />
                    <span className="font-semibold text-black dark:text-white text-sm">
                      Compass Offset Value: {hardwareSettingsValue}
                    </span>
                  </div>
                ) : (
                  <div className="dark:bg-neutral-800/50 mb-6 p-4 border border-neutral-200 dark:border-neutral-700 border-dashed rounded-lg w-full">
                    <div className="py-4 text-center">
                      <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                        No compass offset configured
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isErrorGettingHardwareSettings && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>
                  Error fetching {formatLabel("anemometer_gps_calibration_offset")} data
                </AlertTitle>
              </Alert>
            )}

            {hasError && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>{hasError}</AlertTitle>
              </Alert>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
