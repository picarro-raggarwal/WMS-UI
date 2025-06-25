import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface HealthCheckResponse {
  status: string;
  lastFetched?: number;
}

interface SchedulerRunningResponse {
  running: boolean;
}

// These interfaces represent the parsed schedule job objects for now need to ask AZ to update the API to return the correct objects
interface MeasurementJob {
  job_type: "measure";
  start_epoch: number;
  duration_seconds: number;
  recipe?: number;
}

interface CalibrationJob {
  schedule_id: string;
  job_type: "calibration";
  frequency_unit: string;
  frequency_amount: number;
  start_epoch: number;
  job_duration_seconds: number;
  recipe: number;
}

type ScheduleJob = MeasurementJob | CalibrationJob;

// Interface for scheduling a measure job (simpler, one-time job)
interface ScheduleMeasureJobRequest {
  start_epoch: number;
  recipe_row_id: number;
}

// Interface for scheduling a calibration job (recurring job)
interface ScheduleCalibrationJobRequest {
  start_epoch: number;
  end_epoch: number;
  frequency_unit: string;
  frequency: number;
  recipe_row_id: number;
}

// Interface for running a manual job
interface RunManualJobRequest {
  recipe_row_id: number;
}

export const fencelineSchedulerApi = createApi({
  reducerPath: "fencelineSchedulerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/fenceline_scheduler/api/v1",
  }),
  tagTypes: ["SchedulerHealth", "Schedule"],
  endpoints: (builder) => ({
    getHealthCheck: builder.query<HealthCheckResponse, void>({
      query: () => "/health_check",
      providesTags: ["SchedulerHealth"],
      transformResponse: (response: Omit<HealthCheckResponse, "lastFetched">) => ({
        ...response,
        lastFetched: Date.now(),
      }),
    }),
    isSchedulerRunning: builder.query<boolean, void>({
      query: () => "/is_scheduler_running",
      providesTags: ["SchedulerHealth"],
      transformResponse: (response: SchedulerRunningResponse) => response.running,
    }),
    getCurrentSchedule: builder.query<ScheduleJob[], void>({
      query: () => "/get_current_schedule",
      providesTags: ["Schedule"],
      transformResponse: (response: string) => {
        try {
          // The response is a string containing a JSON array of string-encoded objects
          const rawArray = JSON.parse(response);

          // Parse each job string into a proper object
          return rawArray.map((jobString: string) => {
            // Clean up the string (remove newlines and escape characters)
            const cleanedString = jobString.replace(/\\n/g, "").replace(/\\/g, "");
            // Parse the string into a JSON object, converting Python None to null
            const jsonString = cleanedString.replace(/'/g, '"').replace(/None/g, "null");
            const parsedJob = JSON.parse(jsonString);

            return parsedJob;
          });
        } catch (error) {
          console.error("Error parsing schedule response:", error);
          return [];
        }
      },
    }),
    scheduleMeasureJob: builder.mutation<void, ScheduleMeasureJobRequest>({
      query: (jobDetails) => ({
        url: "/schedule_measure_job",
        method: "POST",
        body: jobDetails,
      }),
      invalidatesTags: ["Schedule"],
    }),
    scheduleCalibrationJob: builder.mutation<void, ScheduleCalibrationJobRequest>({
      query: (jobDetails) => ({
        url: "/schedule_calibration_job",
        method: "POST",
        body: jobDetails,
      }),
      invalidatesTags: ["Schedule"],
    }),
    runManualJob: builder.mutation<void, RunManualJobRequest>({
      query: (jobDetails) => ({
        url: "/run_manual",
        method: "POST",
        body: jobDetails,
      }),
      invalidatesTags: ["Schedule"],
    }),
    stopScheduler: builder.mutation<void, void>({
      query: () => ({
        url: "/stop_scheduler",
        method: "POST",
      }),
      invalidatesTags: ["SchedulerHealth", "Schedule"],
    }),
    scrapSchedule: builder.mutation<void, void>({
      query: () => ({
        url: "/scrap_schedule",
        method: "POST",
      }),
      invalidatesTags: ["Schedule"],
    }),
    startScheduler: builder.mutation<void, void>({
      query: () => ({
        url: "/start_scheduler",
        method: "POST",
      }),
      invalidatesTags: ["SchedulerHealth", "Schedule"],
    }),
    stopManualRun: builder.mutation<void, void>({
      query: () => ({
        url: "/stop_manual_run",
        method: "POST",
      }),
      invalidatesTags: ["SchedulerHealth", "Schedule"],
    }),
  }),
});

export const {
  useGetHealthCheckQuery,
  useIsSchedulerRunningQuery,
  useGetCurrentScheduleQuery,
  useScheduleMeasureJobMutation,
  useScheduleCalibrationJobMutation,
  useRunManualJobMutation,
  useStopSchedulerMutation,
  useScrapScheduleMutation,
  useStartSchedulerMutation,
  useStopManualRunMutation,
} = fencelineSchedulerApi;
