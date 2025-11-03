import L from "leaflet";
import { useEffect } from "react";
import { Marker } from "react-leaflet";
import { PreviewPortMarker as PreviewPortMarkerType } from "../types";

interface PreviewPortMarkerProps {
  previewMarker: PreviewPortMarkerType;
}

export const PreviewPortMarker = ({
  previewMarker
}: PreviewPortMarkerProps) => {
  const previewIcon = L.divIcon({
    className: "preview-port-marker",
    html: `
      <div class="flex items-center justify-center w-8 h-8 bg-gray-800 border-2 border-white rounded-full shadow-lg">
        <span class="text-white text-xs font-bold">${previewMarker.port.portNumber}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  useEffect(() => {
    // Apply custom styles
    const style = document.createElement("style");
    style.textContent = `
      .preview-port-marker {
        background: transparent !important;
        border: none !important;
      }
      .preview-port-marker div {
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [previewMarker.port.portNumber]);

  return (
    <Marker
      position={[previewMarker.coordinates.y, previewMarker.coordinates.x]}
      icon={previewIcon}
      interactive={false}
    />
  );
};
