// Types for our map data
export type BoundaryPoint = { lat: number; lng: number };
export type Boundary = {
  id: string;
  name: string;
  type: "danger" | "warning" | "safe";
  points: BoundaryPoint[];
};

// Image configuration
export const imageConfig = {
  url: "/mock-map.png"
  // corners and bounds will be set dynamically in the component
};

// Mock boundaries data
export const mockBoundaries: Boundary[] = [
  {
    id: "zone-1",
    name: "Danger Zone A",
    type: "danger",
    points: [
      { lat: 0, lng: 0 },
      { lat: 200, lng: 400 },
      { lat: 400, lng: 400 },
      { lat: 400, lng: 200 }
    ]
  },
  {
    id: "zone-2",
    name: "Warning Zone B",
    type: "warning",
    points: [
      { lat: 600, lng: 600 },
      { lat: 600, lng: 800 },
      { lat: 800, lng: 800 },
      { lat: 800, lng: 600 }
    ]
  },
  {
    id: "zone-3",
    name: "Safe Zone C",
    type: "safe",
    points: [
      { lat: 1500, lng: 500 },
      { lat: 1500, lng: 700 },
      { lat: 1000, lng: 1000 }
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
