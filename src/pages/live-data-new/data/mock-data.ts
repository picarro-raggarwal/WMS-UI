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
    data.push({
      id: `id-${i + 1}`,
      label: `Sensor ${i + 1}`,
      portNum,
      conc,
      updatedAt: getRandomDate(),
      isSampling: i === samplingIndex,
      isPrime: i === pumpIndex,
      isInActive: false,
      status: getStatusFromConc(conc),
    });
  }

  return data;
}
