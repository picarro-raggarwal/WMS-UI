/**
 * Converts underscore-separated strings to human-readable format
 * Examples:
 * - "cabinet_temperature" -> "Cabinet Temperature"
 * - "mfc_a" -> "MFC A"
 * - "system_status_error" -> "System Status Error"
 * - "cpu_capacity" -> "CPU Capacity"
 * - "ram_usage" -> "RAM Usage"
 * - "HVACSystem" -> "HVAC System"
 * - "CatalyticConverter" -> "Catalytic Converter"
 */
export function formatLabel(input: string): string {
  if (!input) return "";

  let words: string[];

  // Check if the string contains underscores
  if (input.includes("_")) {
    // Split by underscores and convert to lowercase for consistent processing
    words = input.toLowerCase().split("_");
  } else {
    // Split camelCase/PascalCase words
    words = input
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(" ")
      .map((word) => word.toLowerCase());
  }

  // List of acronyms that should remain uppercase
  const acronyms = new Set([
    "mfc",
    "cpu",
    "ram",
    "hvac",
    "ups",
    "api",
    "url",
    "http",
    "https",
    "json",
    "xml",
    "sql",
    "io",
    "ui",
    "ux",
    "id",
    "uuid",
    "tvoc",
    "ch4",
    "co2",
    "co",
    "no",
    "no2",
    "o3",
    "so2",
    "edc",
    "eto",
    "h2o",
    "hon",
    "gps",
  ]);

  return words
    .map((word, index) => {
      // Check if this word is an acronym
      if (acronyms.has(word)) {
        return word.toUpperCase();
      }

      // If previous word was an acronym and this is a single letter, keep it uppercase
      if (index > 0 && acronyms.has(words[index - 1]) && word.length === 1) {
        return word.toUpperCase();
      }

      // Standard capitalization for other words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
