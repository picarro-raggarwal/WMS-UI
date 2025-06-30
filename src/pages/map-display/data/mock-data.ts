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
  url: "/mock-map.png", // Using the system figure from public directory
  // These coordinates create a simple rectangular space
  // The coordinates are in [latitude, longitude] format
  corners: [
    [100, 100], // new top-left (was bottom-right)
    [0, 100], // new top-right (was bottom-left)
    [0, 0] // new bottom-left (was top-right)
  ] as [number, number][]
};

// Mock boundaries data
export const mockBoundaries: Boundary[] = [
  {
    id: "zone-1",
    name: "Danger Zone A",
    type: "danger",
    points: [
      { lat: 20, lng: 20 },
      { lat: 20, lng: 40 },
      { lat: 40, lng: 40 },
      { lat: 40, lng: 20 }
    ]
  },
  {
    id: "zone-2",
    name: "Warning Zone B",
    type: "warning",
    points: [
      { lat: 60, lng: 60 },
      { lat: 60, lng: 80 },
      { lat: 80, lng: 80 },
      { lat: 80, lng: 60 }
    ]
  },
  {
    id: "zone-3",
    name: "Safe Zone C",
    type: "safe",
    points: [
      { lat: 30, lng: 50 },
      { lat: 50, lng: 70 },
      { lat: 70, lng: 50 }
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

// Map configuration
export const mapConfig = {
  center: [50, 50], // Center of our coordinate system
  zoom: 2,
  minZoom: 1,
  maxZoom: 4
};
