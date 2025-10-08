import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { PortMarker } from "../types";

interface PortMarkerComponentProps {
  marker: PortMarker;
}

export const PortMarkerComponent = ({ marker }: PortMarkerComponentProps) => {
  const map = useMap();

  useEffect(() => {
    // Create a custom div icon for the port marker
    const portIcon = L.divIcon({
      html: `<div style="
        background: #3b82f6;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
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
  }, [map, marker]);

  return null;
};
