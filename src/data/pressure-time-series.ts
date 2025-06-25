const generateTimeSeriesData = () => {
  const now = Date.now();
  const data = [];

  // Generate 24 hours of data, 1 point per second
  const hoursBack = 24;
  const startTime = now - hoursBack * 60 * 60 * 1000;

  // Base pressure value
  let pressure = 100;

  // Generate one point per second
  for (let time = startTime; time <= now; time += 1000) {
    // Add some realistic variation
    // Slow drift + small random noise + periodic component
    const drift = Math.sin(time / (4 * 60 * 60 * 1000)) * 5; // 4-hour cycle
    const noise = (Math.random() - 0.5) * 2;
    pressure = 100 + drift + noise;

    data.push({
      timestamp: time,
      value: Number(pressure.toFixed(2)),
    });
  }

  return data;
};

export const pressureTimeSeriesData = generateTimeSeriesData();
