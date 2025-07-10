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
