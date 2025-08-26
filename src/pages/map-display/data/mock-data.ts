// Types for our map data
export type BoundaryPoint = { lat: number; lng: number };
export type Boundary = {
  id: string;
  name: string;
  type: "safe" | "warning" | "danger";
  points: { lat: number; lng: number }[];
  markers?: { lat: number; lng: number }[];
};

// Image configuration
export const imageConfig = {
  url: "/mock.svg" // dummy1.jpg | mock-map.png
  // corners and bounds will be set dynamically in the component
};

// Mock boundaries data
export const mockBoundaries: Boundary[] = [
  {
    id: "room-1",
    name: "Bedroom 1",
    type: "safe",
    points: [
      { lat: 1744.6146, lng: 1477.3463 },
      { lat: 1743.9736, lng: 1880.492 },
      { lat: 1347.8782, lng: 1880.492 },
      { lat: 1347.2373, lng: 1480.5509 }
    ]
  },
  {
    id: "room-2",
    name: "Bedroom 2",
    type: "warning",
    points: [
      { lat: 1212.2332, lng: 948.3457 },
      { lat: 1212.2332, lng: 1351.3926 },
      { lat: 813.3095, lng: 1351.3926 },
      { lat: 812.2787, lng: 947.3149 }
    ]
  },
  {
    id: "room-3",
    name: "Bathroom",
    type: "danger",
    points: [
      { lat: 1745.3906, lng: 545.8247 },
      { lat: 1743.6069, lng: 815.1696 },
      { lat: 1347.6163, lng: 815.1696 },
      { lat: 1347.6163, lng: 546.7166 }
    ]
  },
  {
    id: "room-4",
    name: "Living Room",
    type: "safe",
    points: [
      { lat: 809.8835, lng: 948.4652 },
      { lat: 812.1187, lng: 1350.7993 },
      { lat: 406.8044, lng: 1350.7993 },
      { lat: 407.5494, lng: 946.9751 }
    ]
  },
  {
    id: "room-5",
    name: "Common Area",
    type: "safe",
    points: [
      { lat: 1741.1746, lng: 820.9646 },
      { lat: 1742.6341, lng: 1119.4308 },
      { lat: 1665.281, lng: 1117.2415 },
      { lat: 1664.5512, lng: 892.4797 },
      { lat: 1542.6836, lng: 892.4797 },
      { lat: 1540.4944, lng: 822.424 }
    ]
  }
];

// Style configurations for different boundary types
export const boundaryStyles = {
  danger: {
    color: "#ff4444",
    weight: 2,
    fillColor: "#ff4444",
    fillOpacity: 0.3
  },
  warning: {
    color: "#ffbb33",
    weight: 2,
    fillColor: "#ffbb33",
    fillOpacity: 0.3
  },
  safe: {
    color: "#00C851",
    weight: 2,
    fillColor: "#00C851",
    fillOpacity: 0.3
  }
};

// // Map configuration
// export const mapConfig = {
//   center: [50, 50], // Center of our coordinate system
//   zoom: 2,
//   minZoom: 1,
//   maxZoom: 4
// };

// Helper: random point in polygon (simple bounding box rejection sampling)
export function randomPointInPolygon(
  polygon: [number, number][]
): [number, number] {
  const lats = polygon.map(([lat]) => lat);
  const lngs = polygon.map(([, lng]) => lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Simple point-in-polygon test (ray-casting)
  function isInside([x, y]: [number, number]) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0],
        yi = polygon[i][1];
      const xj = polygon[j][0],
        yj = polygon[j][1];
      const intersect =
        yi > y !== yj > y &&
        x < ((xj - xi) * (y - yi)) / (yj - yi + 0.00001) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  let pt: [number, number] = [0, 0];
  let tries = 0;
  do {
    pt = [
      minLat + Math.random() * (maxLat - minLat),
      minLng + Math.random() * (maxLng - minLng)
    ];
    tries++;
    if (tries > 100) break; // fallback if polygon is too thin
  } while (!isInside(pt));
  return pt;
}

export const deviceTypes = ["mobile", "hand-held", "watch"];

// Helper to generate moving markers with id and deviceType
export function getMovingMarkers(boundaries: Boundary[]) {
  return boundaries.map((boundary, bIdx) => {
    const poly = boundary.points.map((p) => [p.lat, p.lng] as [number, number]);
    if (
      !poly ||
      poly.length < 3 ||
      poly.some(([lat, lng]) => isNaN(lat) || isNaN(lng))
    ) {
      return [];
    }
    // Generate a random number of markers (2-5) for each boundary
    const numMarkers = Math.floor(Math.random() * 4) + 2; // 2 to 5
    return Array.from({ length: numMarkers }).map((_, idx) => {
      const [lat, lng] = randomPointInPolygon(poly);
      const deviceType =
        deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      return {
        id: `${boundary.id}-marker-${idx}`,
        lat,
        lng,
        deviceType
      };
    });
  });
}
