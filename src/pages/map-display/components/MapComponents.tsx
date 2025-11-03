import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

// Recenter button component
export const RecenterButton = ({
  bounds
}: {
  bounds: L.LatLngBoundsExpression;
}) => {
  const map = useMap();

  const handleClick = () => {
    map.invalidateSize();
    map.fitBounds(bounds, { animate: true });
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
