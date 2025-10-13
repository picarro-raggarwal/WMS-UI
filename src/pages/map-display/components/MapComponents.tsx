import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";

// Recenter button component with dynamic sidebar adjustment
export const RecenterButton = ({
  bounds
}: {
  bounds: L.LatLngBoundsExpression;
}) => {
  const map = useMap();
  const [sidebarState, setSidebarState] = useState<string | null>(null);

  // Function to calculate available space and adjust padding
  const calculatePadding = (isSidebarOpen: boolean): [number, number] => {
    if (!isSidebarOpen) {
      return [0, 0]; // No padding when sidebar is closed
    }

    // Calculate actual sidebar width from DOM
    const sidebarElement =
      document.querySelector("[data-sidebar]") ||
      document.querySelector(".sidebar") ||
      document.querySelector('[class*="sidebar"]');

    if (sidebarElement) {
      const sidebarWidth = sidebarElement.getBoundingClientRect().width;
      // Use a smaller percentage of the sidebar width for padding
      const paddingAmount = Math.min(sidebarWidth * 0.5, 150); // Use 50% of width, max 150px
      return [0, paddingAmount];
    }

    // Fallback: try to detect sidebar by looking for common patterns
    const possibleSidebars = document.querySelectorAll(
      '[class*="w-"], [class*="width-"]'
    );
    for (const element of possibleSidebars) {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      if (
        rect.width > 200 &&
        rect.width < 500 &&
        computedStyle.position !== "static"
      ) {
        const paddingAmount = Math.min(rect.width * 0.5, 150);
        return [0, paddingAmount];
      }
    }

    // Final fallback: use smaller default
    return [0, 100];
  };

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sidebar:state") {
        setSidebarState(e.newValue);
        setTimeout(() => {
          const isSidebarOpen = e.newValue === "true";
          const padding = calculatePadding(isSidebarOpen);
          map.invalidateSize();
          map.fitBounds(bounds, { animate: true, padding });
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }, 200);
      }
    };

    const handleCustomSidebarChange = (e: CustomEvent) => {
      const newState = e.detail?.state;
      setSidebarState(newState);
      setTimeout(() => {
        const isSidebarOpen = newState === "true";
        const padding = calculatePadding(isSidebarOpen);
        map.invalidateSize();
        map.fitBounds(bounds, { animate: true, padding });
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }, 200);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "sidebarStateChange",
      handleCustomSidebarChange as EventListener
    );

    const initialSidebarState = localStorage.getItem("sidebar:state");
    setSidebarState(initialSidebarState);

    const pollInterval = setInterval(() => {
      const currentState = localStorage.getItem("sidebar:state");
      if (currentState !== sidebarState) {
        setSidebarState(currentState);
        setTimeout(() => {
          const isSidebarOpen = currentState === "true";
          const padding = calculatePadding(isSidebarOpen);
          map.invalidateSize();
          map.fitBounds(bounds, { animate: true, padding });
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }, 200);
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "sidebarStateChange",
        handleCustomSidebarChange as EventListener
      );
      clearInterval(pollInterval);
    };
  }, [map, bounds, sidebarState]);

  const handleClick = () => {
    const isSidebarOpen = sidebarState === "true";
    const padding = calculatePadding(isSidebarOpen);
    map.invalidateSize();
    map.fitBounds(bounds, { animate: true, padding });
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  return (
    <button
      onClick={handleClick}
      className="top-4 right-4 z-[1000] absolute bg-white hover:bg-gray-100 shadow px-4 py-2 border border-gray-300 rounded font-medium text-sm"
      style={{ pointerEvents: "auto" }}
    >
      Recenter
    </button>
  );
};

// FitImageBoundsOnce: Only fits bounds on initial mount to prevent unwanted zoom resets on state changes.
export const FitImageBoundsOnce = ({
  bounds
}: {
  bounds: L.LatLngBoundsExpression;
}) => {
  const map = useMap();
  const hasFit = useRef(false);
  useEffect(() => {
    if (!hasFit.current) {
      map.fitBounds(bounds, { animate: true, padding: [0, 0] });
      hasFit.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]); // Only run on mount
  return null;
};
