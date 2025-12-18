import { mockStepNames } from "@/types/common/ports";
import {
  PortConfigurationResponse,
  PortLabelsResponse
} from "./port-configuration.slice";

/**
 * Mock data for port configuration API
 * Matches the API response schema:
 * {
 *   result: {
 *     enabled_ports: number[],
 *     available_ports: number[]
 *   }
 * }
 */
export const mockPortConfigurationData: PortConfigurationResponse = {
  result: {
    enabled_ports: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
      40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
      58, 59, 60, 61, 62, 63, 64
    ],
    available_ports: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
      40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
      58, 59, 60, 61, 62, 63, 64
    ]
  }
};

/**
 * Mock data for port labels API
 * Matches the API response schema:
 * {
 *   result: [
 *     {
 *       portId: string,
 *       portLabel: string
 *     }
 *   ]
 * }
 */
export const mockPortLabelsData: PortLabelsResponse = {
  result: Array.from({ length: 64 }, (_, i) => {
    const portNumber = i + 1;
    return {
      portId: portNumber.toString(),
      portLabel: mockStepNames[portNumber] || `Port ${portNumber}`
    };
  })
};
