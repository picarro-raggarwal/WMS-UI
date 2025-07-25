import { protectedBaseQuery } from "@/common/ProtectedBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface MetricThreshold {
  warning: number;
  alarm: number;
  unit: string;
}

export interface SettingsResponse {
  data: {
    hardware: {
      anemometer: {
        anemometer_gps_calibration_offset: number;
      };
    };
  };
}

export interface SetHardwareSettingsRequest {
  settings: {
    hardware: {
      anemometer: {
        anemometer_gps_calibration_offset: number;
      };
    };
  };
}

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: protectedBaseQuery("/api/fenceline_settings"),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getHardwareSettings: builder.query<SettingsResponse, void>({
      query: () => "/get_hardware_settings",
      providesTags: ["Settings"]
    }),

    setHardwareSettings: builder.mutation<void, SetHardwareSettingsRequest>({
      query: (thresholds) => ({
        url: "/set_hardware_settings",
        method: "POST",
        body: thresholds
      }),
      invalidatesTags: ["Settings"]
    })
  })
});

export const { useGetHardwareSettingsQuery, useSetHardwareSettingsMutation } =
  settingsApi;
