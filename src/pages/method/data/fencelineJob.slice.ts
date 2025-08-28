import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";

interface JobHistoryItem {
  job_id: number;
  created_at: number;
  start_time: number | null;
  end_time: number | null;
  duration: number;
  job_status: string;
  job_type: string;
  recipe_id: number;
  message: string | null;
}

export const fencelineJobApi = createApi({
  reducerPath: "fencelineJobApi",
  baseQuery: protectedBaseQuery("/api/fenceline_job/api/v1"),
  tagTypes: ["JobHistory"],
  endpoints: (builder) => ({
    getJobHistory: builder.query<JobHistoryItem[], void>({
      query: () => ({
        url: "/job_history",
        method: "GET",
        params: {
          num_of_records: 50
        }
      }),
      transformResponse: (response: JobHistoryItem[]) => {
        return response.sort((a, b) => b.job_id - a.job_id);
      },
      providesTags: ["JobHistory"],
      keepUnusedDataFor: 0
    })
  })
});

export const { useGetJobHistoryQuery } = fencelineJobApi;
