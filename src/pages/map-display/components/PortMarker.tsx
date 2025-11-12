import L from "leaflet";
import { memo, useEffect } from "react";
import { useMap } from "react-leaflet";
import { PortMarker } from "../types";
import { getPortStatusColor } from "../utils/mapUtils";

interface PortMarkerComponentProps {
  marker: PortMarker;
}

export const PortMarkerComponent = memo(
  ({ marker }: PortMarkerComponentProps) => {
    const map = useMap();
    const portColor = getPortStatusColor(marker.status);

    useEffect(() => {
      // Create a custom div icon for the port marker
      const portIcon = L.divIcon({
        html: `<div style="
        background: ${portColor};
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      " title="${marker.port.name}">${marker.port.portNumber}</div>`,
        className: "port-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Create marker for the port
      const portMarker = L.marker([marker.position.y, marker.position.x], {
        icon: portIcon
      }).addTo(map);

      // No click handlers - ports cannot be deleted by clicking

      return () => {
        map.removeLayer(portMarker);
      };
    }, [map, marker, portColor]);

    return null;
  }
);
