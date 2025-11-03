import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { MapClickHandlerProps } from "../types";

/**
 * Utility component for handling map click events
 * Attaches/detaches click listeners based on drawing and port placement states
 */
export const MapClickHandler = ({
  isDrawing,
  isAddingPort,
  onClick
}: MapClickHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!isDrawing && !isAddingPort) return;
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [map, isDrawing, isAddingPort, onClick]);

  return null;
};
