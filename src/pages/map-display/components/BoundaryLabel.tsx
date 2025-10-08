import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { BoundaryLabelProps } from "../types";

export const BoundaryLabel = ({
  boundary,
  portMarkers,
  onClick,
  isAddingPort = false,
  isSelected = false
}: BoundaryLabelProps) => {
  const map = useMap();

  useEffect(() => {
    if (!boundary.points || boundary.points.length < 3) return;

    // Get ports for this boundary
    const boundaryPorts = portMarkers.filter(
      (marker) => marker.boundaryId === boundary.id
    );

    // Calculate center point of the boundary
    const validPoints = boundary.points.filter(
      (p) => !isNaN(p.x) && !isNaN(p.y) && p.x !== 0 && p.y !== 0
    );

    if (validPoints.length < 3) return;

    const centerX =
      validPoints.reduce((sum, p) => sum + p.x, 0) / validPoints.length;
    const centerY =
      validPoints.reduce((sum, p) => sum + p.y, 0) / validPoints.length;

    // Create ports display
    const portsDisplay =
      boundaryPorts.length > 0
        ? `<div style="font-size: 12px;  ">
           Ports: ${boundaryPorts.map((p) => p.port.portNumber).join(", ")}
         </div>`
        : "";

    // Create a custom div icon for the label
    const labelIcon = L.divIcon({
      html: `<div style="
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        white-space: nowrap;
        pointer-events: ${isAddingPort ? "none" : "auto"};
        opacity: ${isAddingPort ? "0.6" : "1"};
      ">
        <p style="margin: 0;">${boundary.name}</p>
        ${portsDisplay}
      </div>`,
      className: "boundary-label",
      iconSize: [140, boundaryPorts.length > 0 ? 35 : 20],
      iconAnchor: [70, boundaryPorts.length > 0 ? 17 : 10]
    });

    // Create marker for the label
    const labelMarker = L.marker([centerY, centerX], {
      icon: labelIcon,
      interactive: !isAddingPort // ← Disable marker interaction when adding ports
    }).addTo(map);

    // Add click handler to the label only when not adding ports
    if (!isAddingPort) {
      labelMarker.on("click", () => {
        onClick(boundary);
      });
    }

    return () => {
      map.removeLayer(labelMarker);
    };
  }, [map, boundary, portMarkers, onClick, isAddingPort, isSelected]);

  return null;
};
