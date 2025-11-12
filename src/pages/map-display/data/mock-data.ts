// Types for our map data
export type BoundaryPoint = { x: number; y: number };
export type Boundary = {
  id: string;
  name: string;
  type: 0 | 1 | 2; // 0 = safe, 1 = warning, 2 = danger
  points: { x: number; y: number }[];
  markers?: { x: number; y: number }[];
};

// Import PortMarker type
import { PortMarker } from "../types";
import {
  calculateBoundaryType,
  filterPortsInBoundaries
} from "../utils/mapUtils";

// Image configuration
export const imageConfig = {
  url: "/mock.svg" // dummy1.jpg | mock-map.png
  // corners and bounds will be set dynamically in the component
};

// Base boundaries data (types will be calculated dynamically)
const baseBoundaries: Omit<Boundary, "type">[] = [
  {
    id: "room-1",
    name: "Production Bay A",
    points: [
      { x: 1477.3463, y: 1744.6146 },
      { x: 1880.492, y: 1743.9736 },
      { x: 1880.492, y: 1347.8782 },
      { x: 1480.5509, y: 1347.2373 }
    ]
  },
  {
    id: "room-2",
    name: "Assembly Line 1",
    points: [
      { x: 948.3457, y: 1212.2332 },
      { x: 1351.3926, y: 1212.2332 },
      { x: 1351.3926, y: 813.3095 },
      { x: 947.3149, y: 812.2787 }
    ]
  },
  {
    id: "room-3",
    name: "Utilities Room",
    points: [
      { x: 545.8247, y: 1745.3906 },
      { x: 815.1696, y: 1743.6069 },
      { x: 815.1696, y: 1347.6163 },
      { x: 546.7166, y: 1347.6163 }
    ]
  },
  {
    id: "room-4",
    name: "Quality Control",
    points: [
      { x: 948.4652, y: 809.8835 },
      { x: 1350.7993, y: 812.1187 },
      { x: 1350.7993, y: 406.8044 },
      { x: 946.9751, y: 407.5494 }
    ]
  },
  {
    id: "room-5",
    name: "Storage Bay",
    points: [
      { x: 820.9646, y: 1741.1746 },
      { x: 1119.4308, y: 1742.6341 },
      { x: 1117.2415, y: 1665.281 },
      { x: 892.4797, y: 1664.5512 },
      { x: 892.4797, y: 1542.6836 },
      { x: 822.424, y: 1540.4944 }
    ]
  }
];

// Default port markers placed in boundaries - 3 ports per boundary
const baseMockPortMarkers: PortMarker[] = [
  // Room 1: Production Bay A - 3 ports
  {
    id: "port-marker-1",
    port: {
      id: "port-1",
      portNumber: 1,
      name: "Initialization",
      bankNumber: 1,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-1",
    position: { x: 1600, y: 1600 },
    status: 0 // green
  },
  {
    id: "port-marker-2",
    port: {
      id: "port-5",
      portNumber: 5,
      name: "System Check",
      bankNumber: 1,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-1",
    position: { x: 1750, y: 1450 },
    status: 1 // amber
  },
  {
    id: "port-marker-3",
    port: {
      id: "port-8",
      portNumber: 8,
      name: "Purge",
      bankNumber: 1,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-1",
    position: { x: 1700, y: 1550 },
    status: 2 // red
  },
  // Room 2: Assembly Line 1 - 3 ports
  {
    id: "port-marker-4",
    port: {
      id: "port-12",
      portNumber: 12,
      name: "Analysis",
      bankNumber: 1,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-2",
    position: { x: 1000, y: 1000 },
    status: 0 // green
  },
  {
    id: "port-marker-5",
    port: {
      id: "port-15",
      portNumber: 15,
      name: "Validation",
      bankNumber: 1,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-2",
    position: { x: 1150, y: 1100 },
    status: 1 // amber
  },
  {
    id: "port-marker-6",
    port: {
      id: "port-20",
      portNumber: 20,
      name: "Verification",
      bankNumber: 2,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-2",
    position: { x: 1300, y: 900 },
    status: 2 // red
  },
  // Room 3: Utilities Room - 3 ports
  {
    id: "port-marker-7",
    port: {
      id: "port-18",
      portNumber: 18,
      name: "Data Collection",
      bankNumber: 2,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-3",
    position: { x: 600, y: 1600 },
    status: 0 // green
  },
  {
    id: "port-marker-8",
    port: {
      id: "port-22",
      portNumber: 22,
      name: "Final Review",
      bankNumber: 2,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-3",
    position: { x: 680, y: 1550 },
    status: 1 // amber
  },
  {
    id: "port-marker-9",
    port: {
      id: "port-26",
      portNumber: 26,
      name: "Data Init",
      bankNumber: 2,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-3",
    position: { x: 750, y: 1500 },
    status: 0 // green
  },
  // Room 4: Quality Control - 3 ports
  {
    id: "port-marker-10",
    port: {
      id: "port-25",
      portNumber: 25,
      name: "System Status",
      bankNumber: 2,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-4",
    position: { x: 1000, y: 500 },
    status: 1 // amber
  },
  {
    id: "port-marker-11",
    port: {
      id: "port-30",
      portNumber: 30,
      name: "Final Report",
      bankNumber: 2,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-4",
    position: { x: 1150, y: 600 },
    status: 2 // red
  },
  {
    id: "port-marker-12",
    port: {
      id: "port-35",
      portNumber: 35,
      name: "System Check",
      bankNumber: 3,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-4",
    position: { x: 1200, y: 700 },
    status: 0 // green
  },
  // Room 5: Storage Bay - 3 ports
  {
    id: "port-marker-13",
    port: {
      id: "port-33",
      portNumber: 33,
      name: "Verification",
      bankNumber: 3,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-5",
    position: { x: 950, y: 1650 },
    status: 0 // green
  },
  {
    id: "port-marker-14",
    port: {
      id: "port-40",
      portNumber: 40,
      name: "Sample Collection",
      bankNumber: 3,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-5",
    position: { x: 1000, y: 1600 },
    status: 1 // amber
  },
  {
    id: "port-marker-15",
    port: {
      id: "port-45",
      portNumber: 45,
      name: "Validation",
      bankNumber: 3,
      enabled: true,
      type: "regular"
    },
    boundaryId: "room-5",
    position: { x: 1060, y: 1700 },
    status: 2 // red
  }
];

// Filter mock port markers to ensure all ports are inside their boundaries
export const mockPortMarkers: PortMarker[] = filterPortsInBoundaries(
  baseMockPortMarkers,
  baseBoundaries.map((b) => ({ ...b, type: 0 as 0 | 1 | 2 }))
);

// Calculate boundary types based on validated port statuses
export const mockBoundaries: Boundary[] = baseBoundaries.map((boundary) => ({
  ...boundary,
  type: calculateBoundaryType(boundary.id, mockPortMarkers)
}));

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
