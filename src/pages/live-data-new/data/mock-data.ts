export type MockData = {
  id: string;
  label: string;
  portNum: number;
  conc: string | null;
  updatedAt: string; // ISO timestamp
  isSampling: boolean;
  isInActive: boolean;
  status: 0 | 1 | 2 | 3;
};

export function generateMockData(count: number): MockData[] {
  const getRandomConc = () => {
    const rand = Math.random();
    if (rand < 0.1) return null; // 10% chance of null

    // Generate more varied concentration values for better threshold demonstration
    if (rand > 0.1 && rand < 0.2) {
      return `${(80 + Math.random() * 40).toFixed(1)} ppb`; // 80-120 ppb (above alarm threshold)
    } else if (rand >= 0.2 && rand < 0.4) {
      return `${(50 + Math.random() * 30).toFixed(1)} ppb`; // 50-80 ppb (above warning threshold)
    } else if (rand >= 0.4 && rand < 0.7) {
      return `${(20 + Math.random() * 30).toFixed(1)} ppb`; // 20-50 ppb (normal range)
    } else {
      return `${(Math.random() * 20).toFixed(1)} ppb`; // 0-20 ppb (very low)
    }
  };

  const getRandomDate = () =>
    new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString();

  const getStatusFromConc = (conc: string | null): 0 | 1 | 2 | 3 => {
    // 0: Normal, 1: Warning, 2: Critical, 3: Flow Error
    if (conc === null) return 3;

    const concNum = parseFloat(conc);
    if (concNum > 100) return 2; // Critical
    if (concNum > 50) return 1; // Warning
    return 0; // Normal
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
  const samplingIndex =
    activePorts[Math.floor(Math.random() * activePorts.length)];
  let pumpIndex: number;
  do {
    pumpIndex = activePorts[Math.floor(Math.random() * activePorts.length)];
  } while (pumpIndex === samplingIndex); // Ensure different index

  // Generate final data
  for (let i = 0; i < count; i++) {
    const portNum = (i % 64) + 1;
    const conc = getRandomConc();
    data.push({
      id: `id-${i + 1}`,
      label: `Sensor ${i + 1}`,
      portNum,
      conc,
      updatedAt: getRandomDate(),
      isSampling: i === samplingIndex,
      isInActive: false,
      status: getStatusFromConc(conc)
    });
  }

  return data;
}

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
