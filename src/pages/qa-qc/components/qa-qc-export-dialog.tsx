import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DateTimePicker24h } from "@/components/ui/date-time-picker-24hr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useExportQAQCDataMutation } from "@/pages/data-review/data/dataExport.api";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

import { toast } from "sonner";

export function QAQCExportDialog() {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormData, setExportFormData] = useState({
    start_dt: "",
    end_dt: ""
  });
  const [exportFormError, setExportFormError] = useState<{
    msg: string;
    desc: string;
  } | null>(null);

  const [exportQAQCData, { isLoading: isExporting }] =
    useExportQAQCDataMutation();

  const handleExportInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExportFormData({
      ...exportFormData,
      [name]: value
    });
  };

  const formatDateForApi = (dateString: string): number | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.getTime();
  };

  const handleExportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExportFormError(null);

    if (!exportFormData.start_dt || !exportFormData.end_dt) {
      setExportFormError({
        msg: "Validation Error",
        desc: "Both start and end dates are required"
      });
      return;
    }

    const startTime = formatDateForApi(exportFormData.start_dt);
    const endTime = formatDateForApi(exportFormData.end_dt);

    if (startTime === null || endTime === null) {
      setExportFormError({
        msg: "Validation Error",
        desc: "Invalid date format"
      });
      return;
    }

    if (startTime >= endTime) {
      setExportFormError({
        msg: "Validation Error",
        desc: "End date must be after start date"
      });
      return;
    }

    try {
      const blob = await exportQAQCData({
        start_time: startTime,
        end_time: endTime
      }).unwrap();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const hostname = window.location.hostname
        .split(".")[0]
        .replace(/-/g, "_");
      a.download = `${hostname}_qaqc_export_${startTime}_${endTime}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("QA/QC data exported successfully!");
      setExportModalOpen(false);
      setExportFormData({ start_dt: "", end_dt: "" });
    } catch (err: unknown) {
      console.error("Export failed:", err);
      if (err && typeof err === "object" && "data" in err) {
        const serverData = err as {
          data?: { error?: { description?: string; message?: string } };
        };
        setExportFormError({
          msg: "Export Failed",
          desc:
            serverData?.data?.error?.description ||
            serverData?.data?.error?.message ||
            "Failed to export data. Please try again."
        });
      } else {
        setExportFormError({
          msg: "Export Failed",
          desc: "Failed to export data. Please try again."
        });
      }
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1 shadow-input"
        onClick={() => setExportModalOpen(true)}
      >
        Export QA/QC Data
      </Button>

      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Export QA/QC Data</DialogTitle>
          </DialogHeader>

          {exportFormError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4 text-white" />
              <AlertTitle>{exportFormError.msg}</AlertTitle>
              <AlertDescription>{exportFormError.desc}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleExportSubmit}>
            <div className="gap-5 grid grid-cols-1 mt-1 mb-5">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="start-date">Start Date and Time</Label>
                <DateTimePicker24h
                  id="start-date"
                  type="datetime-local"
                  name="start_dt"
                  value={exportFormData.start_dt}
                  onChange={handleExportInputChange}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="end-date">End Date and Time</Label>
                <DateTimePicker24h
                  id="end-date"
                  type="datetime-local"
                  name="end_dt"
                  value={exportFormData.end_dt}
                  onChange={handleExportInputChange}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setExportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isExporting}
                className="flex-1"
                loading={isExporting}
              >
                Export Data
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
