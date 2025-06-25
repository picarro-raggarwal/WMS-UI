import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "./spinner";
import { SystemComponentsAvailabilityResponse } from "@/pages/dashboard/data/systemMetrics.slice";
import { CheckCircle2, XCircle } from "lucide-react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

interface SystemStartupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  systemComponentsAvailabilityData: SystemComponentsAvailabilityResponse;
  isLoadingSystemComponentsAvailability: boolean;
  errorSystemComponentsAvailability: FetchBaseQueryError | SerializedError;
}

export function SystemStartupModal({
  isOpen,
  onOpenChange,
  systemComponentsAvailabilityData,
  isLoadingSystemComponentsAvailability,
  errorSystemComponentsAvailability,
}: SystemStartupModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-neutral-900 p-10 dark:border-neutral-800 sm:max-w-2xl dark:text-white">
        <DialogHeader className="text-center">
          <div className="flex items-center space-x-2 mx-auto mb-4">
            <Spinner size="5" />
          </div>
          <DialogTitle className="flex justify-center items-center gap-2 dark:text-white">
            System Starting Up
          </DialogTitle>
          <DialogDescription className="px-4 text-center">
            The Fenceline System is currently starting up. Please wait while all components
            initialize.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 px-2 py-4">
          {systemComponentsAvailabilityData?.device_availability && (
            <div className="w-full">
              <SystemComponentsList
                deviceAvailability={systemComponentsAvailabilityData.device_availability}
              />
            </div>
          )}

          {isLoadingSystemComponentsAvailability && <Spinner />}
          {errorSystemComponentsAvailability && (
            <p className="text-red-500 text-sm">
              Error: {JSON.stringify(errorSystemComponentsAvailability)}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeviceStatus({ name, status }: { name: string; status: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {status ? (
        <CheckCircle2 className="w-4 h-4 text-primary-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600" />
      )}
      <span className="text-sm">{name}</span>
    </div>
  );
}

// Component to render device group with sub-components
function DeviceGroup({ name, devices }: { name: string; devices: Record<string, boolean> }) {
  const allAvailable = Object.values(devices).every((status) => status);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 font-medium">
        {allAvailable ? (
          <CheckCircle2 className="w-4 h-4 text-primary-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-600" />
        )}
        <span className="text-sm">{name}</span>
      </div>
      <div className="space-y-1 ml-6">
        {Object.entries(devices).map(([deviceName, status]) => (
          <DeviceStatus key={deviceName} name={deviceName} status={status} />
        ))}
      </div>
    </div>
  );
}

// Component to render all system components
function SystemComponentsList({
  deviceAvailability,
}: {
  deviceAvailability: Record<string, boolean | Record<string, boolean>>;
}) {
  // Separate simple devices from complex device groups
  const simpleDevices: Record<string, boolean> = {};
  const deviceGroups: Record<string, Record<string, boolean>> = {};

  Object.entries(deviceAvailability).forEach(([deviceName, status]) => {
    if (typeof status === "boolean") {
      simpleDevices[deviceName] = status;
    } else {
      deviceGroups[deviceName] = status;
    }
  });

  return (
    <div className="space-y-6">
      {/* Simple Devices Section */}
      {Object.keys(simpleDevices).length > 0 && (
        <div>
          <h5 className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            System Components
          </h5>
          <div className="gap-2 grid grid-cols-2">
            {Object.entries(simpleDevices).map(([deviceName, status]) => (
              <DeviceStatus key={deviceName} name={deviceName} status={status} />
            ))}
          </div>
        </div>
      )}

      {/* Device Groups Section */}
      {Object.keys(deviceGroups).length > 0 && (
        <div>
          <h5 className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            Component Groups
          </h5>
          <div className="gap-4 grid grid-cols-1">
            {Object.entries(deviceGroups).map(([deviceName, devices]) => (
              <DeviceGroup key={deviceName} name={deviceName} devices={devices} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
