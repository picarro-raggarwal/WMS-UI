import _ from "lodash";
import { WindData } from "./types";

export const WIND_PARAMS = {
  meanSpeed: 2.68,
  minSpeed: 0.37,
  maxSpeed: 4.79,
  speedChangeRate: 0.42,
  directionChangeRate: 8.1,
  minDirection: 20,
  maxDirection: 102,
};

export function simulateWind(prev: WindData): WindData {
  const speedDelta = _.random(-WIND_PARAMS.speedChangeRate, WIND_PARAMS.speedChangeRate, true);
  const newSpeed = _.clamp(prev.speed + speedDelta, WIND_PARAMS.minSpeed, WIND_PARAMS.maxSpeed);

  const dirDelta = _.random(
    -WIND_PARAMS.directionChangeRate,
    WIND_PARAMS.directionChangeRate,
    true
  );
  const newDirection = _.clamp(
    prev.direction + dirDelta,
    WIND_PARAMS.minDirection,
    WIND_PARAMS.maxDirection
  );

  return { speed: newSpeed, direction: newDirection };
}
