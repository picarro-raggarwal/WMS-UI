export const mockHistory = [
  {
    tagId: "T-001",
    concentration: 12.5,
    compound: "Methane",
    avg24hr: 10.2,
    exposure: "Low",
    location: "Zone A"
  },
  {
    tagId: "T-002",
    concentration: 8.1,
    compound: "Ethane",
    avg24hr: 7.9,
    exposure: "Medium",
    location: "Zone B"
  },
  {
    tagId: "T-003",
    concentration: 15.3,
    compound: "Propane",
    avg24hr: 13.7,
    exposure: "High",
    location: "Zone C"
  },
  {
    tagId: "T-004",
    concentration: 5.6,
    compound: "Methane",
    avg24hr: 6.2,
    exposure: "Low",
    location: "Zone A"
  },
  {
    tagId: "T-005",
    concentration: 20.1,
    compound: "Ethane",
    avg24hr: 18.4,
    exposure: "High",
    location: "Zone D"
  },
  {
    tagId: "T-006",
    concentration: 9.8,
    compound: "Butane",
    avg24hr: 8.7,
    exposure: "Medium",
    location: "Zone E"
  },
  {
    tagId: "T-007",
    concentration: 17.2,
    compound: "Methane",
    avg24hr: 16.1,
    exposure: "High",
    location: "Zone F"
  },
  {
    tagId: "T-008",
    concentration: 6.4,
    compound: "Propane",
    avg24hr: 7.0,
    exposure: "Low",
    location: "Zone B"
  },
  {
    tagId: "T-009",
    concentration: 13.5,
    compound: "Butane",
    avg24hr: 12.9,
    exposure: "Medium",
    location: "Zone G"
  },
  {
    tagId: "T-010",
    concentration: 11.3,
    compound: "Ethane",
    avg24hr: 10.8,
    exposure: "Low",
    location: "Zone H"
  }
];

export const allCompounds = Array.from(
  new Set(mockHistory.map((h) => h.compound))
);
export const allExposures = Array.from(
  new Set(mockHistory.map((h) => h.exposure))
);
export const allLocations = Array.from(
  new Set(mockHistory.map((h) => h.location))
);

// Room History mock data
export const mockRoomHistory = [
  {
    timestamp: "2025-07-01 10:00:00",
    roomId: "Room-101",
    currentConcentration: 12.5,
    compounds: ["Methane", "Ethane"],
    currentTagsPresent: ["T-001", "T-002"]
  },
  {
    timestamp: "2025-07-01 10:05:00",
    roomId: "Room-102",
    currentConcentration: 8.1,
    compounds: ["Propane"],
    currentTagsPresent: ["T-003"]
  },
  {
    timestamp: "2025-07-01 10:10:00",
    roomId: "Room-101",
    currentConcentration: 15.3,
    compounds: ["Methane", "Propane"],
    currentTagsPresent: ["T-001", "T-004"]
  },
  {
    timestamp: "2025-07-01 10:15:00",
    roomId: "Room-103",
    currentConcentration: 5.6,
    compounds: ["Ethane"],
    currentTagsPresent: ["T-005"]
  },
  {
    timestamp: "2025-07-02 10:20:00",
    roomId: "Room-102",
    currentConcentration: 20.1,
    compounds: ["Methane", "Ethane", "Propane"],
    currentTagsPresent: ["T-002", "T-003", "T-006"]
  }
];

export const allRoomIds = Array.from(
  new Set(mockRoomHistory.map((h) => h.roomId))
);
export const allRoomCompounds = Array.from(
  new Set(mockRoomHistory.flatMap((h) => h.compounds))
);
export const allRoomTags = Array.from(
  new Set(mockRoomHistory.flatMap((h) => h.currentTagsPresent))
);

// Mock heatmap data for tag exposure levels
export const tagHeatmapData: Record<
  string,
  { time: string; exposureLevel: number }[]
> = {
  "T-001": [
    { time: "2024-06-01 00:00", exposureLevel: 2 },
    { time: "2024-06-01 06:00", exposureLevel: 3 },
    { time: "2024-06-01 12:00", exposureLevel: 5 },
    { time: "2024-06-01 18:00", exposureLevel: 4 },
    { time: "2024-06-02 00:00", exposureLevel: 1 }
  ],
  "T-002": [
    { time: "2024-06-01 00:00", exposureLevel: 1 },
    { time: "2024-06-01 06:00", exposureLevel: 2 },
    { time: "2024-06-01 12:00", exposureLevel: 2 },
    { time: "2024-06-01 18:00", exposureLevel: 3 },
    { time: "2024-06-02 00:00", exposureLevel: 2 }
  ],
  "T-003": [
    { time: "2024-06-01 00:00", exposureLevel: 4 },
    { time: "2024-06-01 06:00", exposureLevel: 4 },
    { time: "2024-06-01 12:00", exposureLevel: 5 },
    { time: "2024-06-01 18:00", exposureLevel: 5 },
    { time: "2024-06-02 00:00", exposureLevel: 3 }
  ]
  // Add more tagIds as needed
};

// Expanded mock heatmap data for eCharts (matrix: [day, hour, value])
export const tagHeatmapMatrixData: Record<
  string,
  Array<[string, string, number]>
> = {
  "T-001": Array.from({ length: 100 }, (_, i) => [
    `2024-06-${String(1 + Math.floor(i / 10)).padStart(2, "0")}`,
    `${String((i % 10) * 2).padStart(2, "0")}:00`,
    Math.floor(Math.random() * 6)
  ]),
  "T-002": Array.from({ length: 100 }, (_, i) => [
    `2024-06-${String(1 + Math.floor(i / 10)).padStart(2, "0")}`,
    `${String((i % 10) * 2).padStart(2, "0")}:00`,
    1 + ((i * 2) % 5)
  ]),
  "T-003": Array.from({ length: 100 }, (_, i) => [
    `2024-06-${String(1 + Math.floor(i / 10)).padStart(2, "0")}`,
    `${String((i % 10) * 2).padStart(2, "0")}:00`,
    2 + ((i * 3) % 4)
  ]),
  "T-004": Array.from({ length: 100 }, (_, i) => [
    `2024-06-${String(1 + Math.floor(i / 10)).padStart(2, "0")}`,
    `${String((i % 10) * 2).padStart(2, "0")}:00`,
    Math.floor(3 + 2 * Math.sin(i / 10))
  ]),
  "T-005": Array.from({ length: 100 }, (_, i) => [
    `2024-06-${String(1 + Math.floor(i / 10)).padStart(2, "0")}`,
    `${String((i % 10) * 2).padStart(2, "0")}:00`,
    i % 6
  ]),
  "T-006": Array.from({ length: 100 }, (_, i) => [
    `2024-06-${String(1 + Math.floor(i / 10)).padStart(2, "0")}`,
    `${String((i % 10) * 2).padStart(2, "0")}:00`,
    1 + Math.floor(Math.abs(Math.cos(i / 8) * 4))
  ]),
  "T-007": Array.from({ length: 100 }, (_, i) => [
    `2024-06-${String(1 + Math.floor(i / 10)).padStart(2, "0")}`,
    `${String((i % 10) * 2).padStart(2, "0")}:00`,
    2 + ((i * 5) % 4)
  ]),
  "T-008": Array.from({ length: 100 }, (_, i) => [
    `2024-06-${String(1 + Math.floor(i / 10)).padStart(2, "0")}`,
    `${String((i % 10) * 2).padStart(2, "0")}:00`,
    1 + ((i * 7) % 5)
  ]),
  "T-009": Array.from({ length: 100 }, (_, i) => [
    `2024-06-${String(1 + Math.floor(i / 10)).padStart(2, "0")}`,
    `${String((i % 10) * 2).padStart(2, "0")}:00`,
    2 + ((i * 4) % 4)
  ]),
  "T-010": Array.from({ length: 100 }, (_, i) => [
    `2024-06-${String(1 + Math.floor(i / 10)).padStart(2, "0")}`,
    `${String((i % 10) * 2).padStart(2, "0")}:00`,
    Math.floor(1 + Math.abs(Math.sin(i / 5) * 5))
  ])
};

// Mock data for room exposure heatmap
export const roomHeatmapRooms = [
  "Room-101",
  "Room-102",
  "Room-103",
  "Room-104",
  "Room-105"
];
export const roomHeatmapTimes = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00"
];
export const roomHeatmapCompound = "Methane";

// Generate mock data: [roomIndex, timeIndex, value]
export const roomHeatmapMatrixData = [] as Array<[number, number, number]>;
for (let i = 0; i < roomHeatmapRooms.length; i++) {
  for (let j = 0; j < roomHeatmapTimes.length; j++) {
    const dwellTime = Math.floor(Math.random() * 60); // minutes
    const concentration = Math.random() * 10; // ppm
    const totalExposure = Math.round(dwellTime * concentration);
    roomHeatmapMatrixData.push([Number(i), Number(j), totalExposure]);
  }
}
