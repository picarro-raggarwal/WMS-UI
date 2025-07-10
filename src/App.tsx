import { SystemStartupModal } from "@/components/SystemStartupModal";
import { Toaster } from "@/components/ui/sonner";
import { useSocket } from "@/hooks/useSocket";
import { useGetSystemInfoQuery } from "@/lib/services/systemInfo.slice";
import { useGetTimeQuery } from "@/lib/services/timesync.slice";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useGetSystemComponentsAvailabilityQuery } from "./pages/dashboard/data/systemMetrics.slice";

function App() {
  // Initialize socket connections at app level for all routes
  const { fencelineJobState, connected } = useSocket();
  const [showStartupModal, setShowStartupModal] = useState(false);
  const {
    data: systemComponentsAvailabilityData,
    isLoading: isLoadingSystemComponentsAvailability,
    error: errorSystemComponentsAvailability
  } = useGetSystemComponentsAvailabilityQuery(undefined, {
    skip: !showStartupModal,
    pollingInterval: 5000
  });

  // Initialize timesync at root level with polling every 30 seconds
  useGetTimeQuery(undefined, {
    pollingInterval: 30000
  });

  // Initialize system info at root level (fetch once on app load)
  useGetSystemInfoQuery();

  // Check for SystemStartup state from websocket
  useEffect(() => {
    if (fencelineJobState) {
      let state: string | undefined;

      if (
        fencelineJobState.data &&
        typeof fencelineJobState.data === "object" &&
        fencelineJobState.data !== null
      ) {
        state = (fencelineJobState.data as { state?: string }).state;
      } else if (typeof fencelineJobState.state === "string") {
        state = fencelineJobState.state;
      }

      if (state === "SystemStartup") {
        const allComponentsAvailable =
          systemComponentsAvailabilityData?.device_availability
            ? Object.values(
                systemComponentsAvailabilityData.device_availability
              ).every((status) => {
                // Handle both boolean values and nested objects
                if (typeof status === "boolean") {
                  return status;
                } else if (typeof status === "object" && status !== null) {
                  // For nested objects, check that all sub-components are true
                  return Object.values(status).every(
                    (subStatus) => subStatus === true
                  );
                }
                return false;
              })
            : false;

        if (allComponentsAvailable) {
          setShowStartupModal(false);
        } else {
          setShowStartupModal(true);
        }
      } else {
        setShowStartupModal(false);
      }
    }
  }, [connected, fencelineJobState, systemComponentsAvailabilityData]);

  useEffect(() => {
    //dark mode only in dev mode
    if (import.meta.env.VITE_UI_VERSION !== "dev") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.remove("font-barlow");
      return;
    }

    // Initialize theme and font from localStorage
    const savedTheme = localStorage.getItem("theme");
    // Apply initial theme and font
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div>
      <Outlet />
      <Toaster
        // closeButton
        toastOptions={{
          classNames: {
            toast: "bg-white text-black",
            error: "bg-red-600 text-white"
          }
        }}
        icons={{
          success: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-6 text-primary-600"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                clipRule="evenodd"
              />
            </svg>
          )
        }}
      />
      <SystemStartupModal
        isOpen={showStartupModal}
        onOpenChange={setShowStartupModal}
        systemComponentsAvailabilityData={systemComponentsAvailabilityData}
        isLoadingSystemComponentsAvailability={
          isLoadingSystemComponentsAvailability
        }
        errorSystemComponentsAvailability={errorSystemComponentsAvailability}
      />
    </div>
  );
}

export default App;
