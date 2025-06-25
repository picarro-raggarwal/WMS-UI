import { useEffect, useState, useCallback } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/spinner";
import { Card } from "@/components/ui/card";
import ModelViewer from "@/pages/dashboard/components/model-view-sam";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Link } from "react-router";

interface SetupStep {
  label: string;
  description: string;
  status: "pending" | "loading" | "complete";
}

const SetupView = () => {
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      label: "System Initialization",
      description: "Booting up core systems and checking hardware integrity",
      status: "loading",
    },
    {
      label: "Sensor Calibration",
      description: "Calibrating environmental and analytical sensors",
      status: "pending",
    },
    {
      label: "Network Configuration",
      description: "Establishing secure network connections",
      status: "pending",
    },
    {
      label: "Database Setup",
      description: "Initializing measurement database",
      status: "pending",
    },
    {
      label: "System Validation",
      description: "Performing final system checks",
      status: "pending",
    },
  ]);

  const updateStep = useCallback(() => {
    if (currentStep < steps.length) {
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps];
        if (currentStep > 0) {
          newSteps[currentStep - 1].status = "complete";
        }
        newSteps[currentStep].status = "loading";
        return newSteps;
      });

      setProgress((currentStep + 1) * (100 / steps.length));
      setCurrentStep((prev) => prev + 1);
    } else {
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          status: "complete",
        }))
      );
    }
  }, [currentStep, steps.length]);

  useEffect(() => {
    const interval = setInterval(updateStep, 1500);
    return () => clearInterval(interval);
  }, [updateStep]);

  //once last step is complete, set isRotating to false
  useEffect(() => {
    if (currentStep - 1 === steps.length - 1) {
      //wait 500 ms
      setTimeout(() => {
        setIsRotating(false);
      }, 1500);
    }
  }, [currentStep, steps.length]);

  return (
    <div className="grid grid-cols-5 h-screen   rounded-lg overflow-hidden">
      <div className="flex flex-col col-span-3  justify-center max-w-2xl mx-auto px-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            {steps[steps.length - 1].status === "complete"
              ? "Your Fenceline System is ready"
              : "Your Picarro Fenceline System is almost ready."}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {steps[steps.length - 1].status === "complete"
              ? "System setup complete. Your device is now configured and ready for operation."
              : "Welcome to your Fencline System. Please wait while we configure your device. This may take a few minutes."}
          </p>
          {steps[steps.length - 1].status === "complete" && (
            <Link to="/dashboard">
              <Button className="mt-4" variant="primary">
                Proceed to Dashboard
              </Button>
            </Link>
          )}
        </div>

        {steps[steps.length - 1].status === "complete" ? null : (
          <Progress value={progress} className="w-full" />
        )}
        <Card className="p-8 max-w-lg">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                {step.status === "loading" && <Spinner size="4" />}
                {step.status === "complete" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5 text-primary-500 -mr-1">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                )}
                {step.status === "pending" && (
                  <div className="w-4 h-4 rounded-full border-2 border-neutral-200 border-inset" />
                )}
                <div
                  className={`space-y-1 -mt-0.5 ${step.status === "pending" ? "opacity-50" : ""}`}>
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="  overflow-hidden   col-span-2">
        <ModelViewer isRotating={isRotating} />
      </div>
    </div>
  );
};

export default SetupView;
