// Generate a full 24 hours of data at 15-minute intervals
const generateStaticHistoricalData = () => {
  const data = [];
  const now = new Date();
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);

  // Start 24 hours ago
  const startTime = new Date(now);
  startTime.setHours(now.getHours() - 24);

  let value = 100; // Starting value

  // Generate a data point every 15 minutes
  for (let time = startTime.getTime(); time <= now.getTime(); time += 15 * 60 * 1000) {
    // Add some realistic-looking variation
    value = value + Math.sin(time / 3600000) * 2 + (Math.random() - 0.5) * 3;

    data.push({
      timestamp: time,
      value: Number(value.toFixed(2)),
    });
  }

  return data;
};

export const historicalPressureData = generateStaticHistoricalData();
