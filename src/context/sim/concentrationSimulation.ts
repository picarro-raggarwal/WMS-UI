import _ from "lodash";
import { ConcentrationData } from "./types";

export const CONCENTRATION_PARAMS = {
  TVOC: {
    mean: 45,
    min: 30,
    max: 60,
    changeRate: 0.8,
  },
  EtO: {
    mean: 1.2,
    min: 0.5,
    max: 2.0,
    changeRate: 0.05,
  },
};

function simulateValue(prev: number, params: typeof CONCENTRATION_PARAMS.TVOC) {
  const delta = _.random(-params.changeRate, params.changeRate, true);
  return _.clamp(prev + delta, params.min, params.max);
}

export function simulateConcentrations(prev: ConcentrationData): ConcentrationData {
  return {
    TVOC: simulateValue(prev.TVOC, CONCENTRATION_PARAMS.TVOC),
    EtO: simulateValue(prev.EtO, CONCENTRATION_PARAMS.EtO),
  };
}
