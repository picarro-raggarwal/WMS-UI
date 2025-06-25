import _ from "lodash";
import { EnvironmentData } from "./types";

export const ENVIRONMENT_PARAMS = {
  cabinetTemp: {
    min: 0,
    max: 100,
    changeRate: 0.5,
  },
  cavityPressure: {
    min: 0,
    max: 100,
    changeRate: 1.0,
  },
};

export function simulateEnvironment(prev: EnvironmentData): EnvironmentData {
  return {
    cabinetTemp: _.clamp(
      prev.cabinetTemp +
        _.random(
          -ENVIRONMENT_PARAMS.cabinetTemp.changeRate,
          ENVIRONMENT_PARAMS.cabinetTemp.changeRate,
          true
        ),
      ENVIRONMENT_PARAMS.cabinetTemp.min,
      ENVIRONMENT_PARAMS.cabinetTemp.max
    ),
    cavityPressure: _.clamp(
      prev.cavityPressure +
        _.random(
          -ENVIRONMENT_PARAMS.cavityPressure.changeRate,
          ENVIRONMENT_PARAMS.cavityPressure.changeRate,
          true
        ),
      ENVIRONMENT_PARAMS.cavityPressure.min,
      ENVIRONMENT_PARAMS.cavityPressure.max
    ),
  };
}
