import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface VertexMarkerProps {
  position: [number, number];
  vertexNumber: number;
  onClick?: () => void;
}

export const VertexMarker = ({
  position,
  vertexNumber,
  onClick
}: VertexMarkerProps) => {
  const map = useMap();

  useEffect(() => {
    // Create custom div icon for the vertex marker
    const vertexIcon = L.divIcon({
      html: `<div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: #4A494A;
        border: 2px solid white;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">${vertexNumber}</div>`,
      className: "vertex-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Create marker for the vertex
    const vertexMarker = L.marker(position, {
      icon: vertexIcon,
      zIndexOffset: 1000
    }).addTo(map);

    // Add click handler
    if (onClick) {
      vertexMarker.on("click", onClick);
    }

    return () => {
      map.removeLayer(vertexMarker);
    };
  }, [map, position, vertexNumber, onClick]);

  return null;
};
