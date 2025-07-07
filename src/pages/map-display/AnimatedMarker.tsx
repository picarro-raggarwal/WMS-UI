import { useEffect, useRef, useState } from "react";
import { CircleMarker, Popup, useMap } from "react-leaflet";

interface AnimatedMarkerProps {
  id: string;
  position: [number, number];
  deviceType: string;
  tagNumber: number;
  color?: string;
  size?: number;
}

export const AnimatedMarker = ({
  id,
  position,
  deviceType,
  tagNumber,
  color = "#2563eb",
  size = 6
}: AnimatedMarkerProps) => {
  const [animatedPos, setAnimatedPos] = useState<[number, number]>(position);
  const prevPos = useRef<[number, number]>(position);
  const animFrame = useRef<number | null>(null);
  useMap();

  useEffect(() => {
    if (
      prevPos.current[0] === position[0] &&
      prevPos.current[1] === position[1]
    ) {
      return;
    }
    const duration = 500; // ms
    const start = performance.now();
    const from = prevPos.current;
    const to = position;

    function animate(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const lat = from[0] + (to[0] - from[0]) * t;
      const lng = from[1] + (to[1] - from[1]) * t;
      setAnimatedPos([lat, lng]);
      if (t < 1) {
        animFrame.current = requestAnimationFrame(animate);
      } else {
        prevPos.current = to;
      }
    }
    animFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [position]);

  return (
    <CircleMarker
      center={animatedPos}
      radius={size}
      color={color}
      fillColor={color}
      fillOpacity={0.7}
      weight={2}
    >
      <Popup>
        <div style={{ minWidth: 120 }}>
          <div>
            <strong>Tag:</strong> #{tagNumber}
          </div>
          <div>
            <strong>ID:</strong> {id}
          </div>
          <div>
            <strong>Device:</strong> {deviceType}
          </div>
          <div>
            <strong>Lat:</strong> {animatedPos[0].toFixed(4)}
          </div>
          <div>
            <strong>Lng:</strong> {animatedPos[1].toFixed(4)}
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
};
