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
      { lat: 1744.6146305176096, lng: 1477.3463348064254 },
      { lat: 1743.9736993528345, lng: 1880.4920374499143 },
      { lat: 1347.878239521871, lng: 1880.4920374499143 },
      { lat: 1347.237308357096, lng: 1480.5509906303005 }
    ]
  },
  {
    id: "room-2",
    name: "Bedroom 2",
    type: "warning",
    points: [
      { lat: 1212.2332490765068, lng: 948.3457390734576 },
      { lat: 1212.2332490765068, lng: 1351.3926781796772 },
      { lat: 813.3095523140848, lng: 1351.3926781796772 },
      { lat: 812.2787417281354, lng: 947.3149284875083 }
    ]
  },
  {
    id: "room-3",
    name: "Bathroom",
    type: "danger",
    points: [
      { lat: 1745.3906571580546, lng: 545.8247737254621 },
      { lat: 1743.6069160674485, lng: 815.169678406981 },
      { lat: 1347.6163939528976, lng: 815.169678406981 },
      { lat: 1347.6163939528976, lng: 546.7166442707652 }
    ]
  },
  {
    id: "room-4",
    name: "Living Room",
    type: "safe",
    points: [
      { lat: 809.883553769781, lng: 948.4652842216478 },
      { lat: 812.1187429706175, lng: 1350.799340372229 },
      { lat: 406.8044345522543, lng: 1350.799340372229 },
      { lat: 407.54949761919977, lng: 946.9751580877568 }
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
