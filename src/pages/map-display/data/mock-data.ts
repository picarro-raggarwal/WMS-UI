// Types for our map data
export type BoundaryPoint = { x: number; y: number };
export type Boundary = {
  id: string;
  name: string;
  type: "safe" | "warning" | "danger";
  points: { x: number; y: number }[];
  markers?: { x: number; y: number }[];
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
      { x: 1744.6146, y: 1477.3463 },
      { x: 1743.9736, y: 1880.492 },
      { x: 1347.8782, y: 1880.492 },
      { x: 1347.2373, y: 1480.5509 }
    ]
  },
  {
    id: "room-2",
    name: "Bedroom 2",
    type: "warning",
    points: [
      { x: 1212.2332, y: 948.3457 },
      { x: 1212.2332, y: 1351.3926 },
      { x: 813.3095, y: 1351.3926 },
      { x: 812.2787, y: 947.3149 }
    ]
  },
  {
    id: "room-3",
    name: "Bathroom",
    type: "danger",
    points: [
      { x: 1745.3906, y: 545.8247 },
      { x: 1743.6069, y: 815.1696 },
      { x: 1347.6163, y: 815.1696 },
      { x: 1347.6163, y: 546.7166 }
    ]
  },
  {
    id: "room-4",
    name: "Living Room",
    type: "safe",
    points: [
      { x: 809.8835, y: 948.4652 },
      { x: 812.1187, y: 1350.7993 },
      { x: 406.8044, y: 1350.7993 },
      { x: 407.5494, y: 946.9751 }
    ]
  },
  {
    id: "room-5",
    name: "Common Area",
    type: "safe",
    points: [
      { x: 1741.1746, y: 820.9646 },
      { x: 1742.6341, y: 1119.4308 },
      { x: 1665.281, y: 1117.2415 },
      { x: 1664.5512, y: 892.4797 },
      { x: 1542.6836, y: 892.4797 },
      { x: 1540.4944, y: 822.424 }
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
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

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
      minX + Math.random() * (maxX - minX),
      minY + Math.random() * (maxY - minY)
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
    const poly = boundary.points.map((p) => [p.x, p.y] as [number, number]);
    if (
      !poly ||
      poly.length < 3 ||
      poly.some(([x, y]) => isNaN(x) || isNaN(y))
    ) {
      return [];
    }
    // Generate a random number of markers (2-5) for each boundary
    const numMarkers = Math.floor(Math.random() * 4) + 2; // 2 to 5
    return Array.from({ length: numMarkers }).map((_, idx) => {
      const [x, y] = randomPointInPolygon(poly);
      const deviceType =
        deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      return {
        id: `${boundary.id}-marker-${idx}`,
        x,
        y,
        deviceType
      };
    });
  });
}
