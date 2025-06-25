export type MockData = {
  id: string;
  label: string;
  portNum: number;
  conc: string | null;
  updatedAt: string; // ISO timestamp
  isSampling: boolean;
  isPrime: boolean;
  isInActive: boolean;
  status: 0 | 1 | 2 | 3;
  color: string;
  colorValue: string;
  chart: { time: string; value: string }[];
};

export function generateMockData(count: number): MockData[] {
  const getRandomConc = () => {
    const rand = Math.random();
    if (rand < 0.1) return null; // 10% chance of null

    if (rand > 0.1 && rand < 0.15) {
      return `${(100 + Math.random() * 20).toFixed(1)} ppb`;
    } else if (rand >= 0.15 && rand < 0.25) {
      return `${(50 + Math.random() * 50).toFixed(1)} ppb`;
    } else {
      return `${(Math.random() * 50).toFixed(1)} ppb`;
    }
  };

  const getRandomDate = () =>
    new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString();

  const getStatusFromConc = (conc: string | null): 0 | 1 | 2 | 3 => {
    // 0: Normal, 1: Warning, 2: Critical, 3: Flow Error
    if (conc === null) return 3;

    const concNum = parseFloat(conc);
    if (concNum > 100) return 2;
    if (concNum > 50) return 1;
    return 0;
  };

  const data: MockData[] = [];
  const activePorts: number[] = [];

  // First, generate all ports and identify active ones (non-null concentration)
  for (let i = 0; i < count; i++) {
    const conc = getRandomConc();
    if (conc !== null) {
      activePorts.push(i);
    }
  }

  // Choose random indices for isSampling and isPrime only from active ports
  const samplingIndex = activePorts[Math.floor(Math.random() * activePorts.length)];
  let pumpIndex: number;
  do {
    pumpIndex = activePorts[Math.floor(Math.random() * activePorts.length)];
  } while (pumpIndex === samplingIndex); // Ensure different index

  // Generate final data
  for (let i = 0; i < count; i++) {
    const portNum = (i % 64) + 1;
    const conc = getRandomConc();
    const status = getStatusFromConc(conc);
    // 24 hours, 500 points: interval = 24*60/500 = 2.88 minutes per point
    const now = Date.now();
    const numPoints = 500;
    const intervalMin = (24 * 60) / numPoints;
    const chart = Array.from({ length: numPoints }, (_, idx) => {
      const time = new Date(now - (numPoints - 1 - idx) * intervalMin * 60 * 1000).toISOString();
      // Completely random value between 0 and 100
      const value = Math.random() * 100;
      return {
        time,
        value: value.toFixed(2),
      };
    });
    data.push({
      id: `id-${i + 1}`,
      label: `${i + 1}`,
      portNum,
      conc,
      updatedAt: getRandomDate(),
      isSampling: i === samplingIndex,
      isPrime: i === pumpIndex,
      isInActive: false,
      status: status,
      color: getColorValue(status),
      colorValue: getColorValue(status),
      chart,
    });
  }

  return data;
}

export const getStatusText = (status: 0 | 1 | 2 | 3): string => {
  switch (status) {
    case 0:
      return "Normal";
    case 1:
      return "Warning";
    case 2:
      return "Critical";
    case 3:
      return "Flow Error";
    default:
      return "Unknown";
  }
};

export const getBgColor = (status: 0 | 1 | 2 | 3): string => {
  switch (status) {
    case 0:
      return "bg-inherit";
    case 1:
      return "bg-amber-100";
    case 2:
      return "bg-red-500";
    case 3:
      return "bg-cyan-100"; // flow error
    default:
      return "bg-gray-400";
  }
};

export const getTextColor = (status: 0 | 1 | 2 | 3) => {
  switch (status) {
    case 0:
      return "text-primary-600";
    case 1:
      return "text-amber-600";
    case 2:
      return "text-red-600";
    case 3:
      return "text-cyan-600"; // flow error
    default:
      return "text-gray-600";
  }
};

export const getColorValue = (status: 0 | 1 | 2 | 3): string => {
  switch (status) {
    case 0:
      return "#30ad3a";
    case 1:
      return "#F59E42";
    case 2:
      return "#EF4444";
    case 3:
      return "#06B6D4"; // flow error
    default:
      return "#fff";
  }
};
