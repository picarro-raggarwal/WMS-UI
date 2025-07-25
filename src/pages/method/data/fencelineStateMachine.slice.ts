import { protectedBaseQuery } from "@/common/ProtectedBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface FencelineState {
  state: string;
  lastFetched?: number;
}

export interface CurrentJob {
  job_type: string;
  status: string;
  job_id: number;
  start_time: number;
  end_time: number | null;
  duration: number;
  elapsed_time: number;
  recipe: string;
  recipe_name: string;
}

export interface MeasurementStatus {
  system_status: string;
  current_job?: CurrentJob;
  lastFetched?: number;
}

export const fencelineStateMachineApi = createApi({
  reducerPath: "fencelineStateMachineApi",
  baseQuery: protectedBaseQuery("/api/fenceline_state_machine/api/v1"),
  tagTypes: ["FencelineState", "MeasurementStatus"],
  endpoints: (builder) => ({
    getCurrentState: builder.query<FencelineState, void>({
      query: () => "/current_state",
      providesTags: ["FencelineState"],
      transformResponse: (response: Omit<FencelineState, "lastFetched">) => ({
        ...response,
        lastFetched: Date.now()
      })
    }),
    getMeasurementStatus: builder.query<MeasurementStatus, void>({
      query: () => "/measurement_status",
      providesTags: ["MeasurementStatus"],
      transformResponse: (
        response: Omit<MeasurementStatus, "lastFetched">
      ) => ({
        ...response,
        lastFetched: Date.now()
      })
    })
  })
});

export const { useGetCurrentStateQuery, useGetMeasurementStatusQuery } =
  fencelineStateMachineApi;
