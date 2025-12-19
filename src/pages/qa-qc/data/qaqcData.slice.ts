import { protectedBaseQuery } from "@/utils/api/ProtectedBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const qaqcDataApi = createApi({
  reducerPath: "qaqcDataApi",
  baseQuery: protectedBaseQuery(
    import.meta.env.VITE_FENCELINE_API_BASE_URL || "/api/fenceline_data/api/v1"
  ),
  tagTypes: ["QaQcState", "QaQcStateSummary", "QaQcHistory"],
  endpoints: (builder) => ({
    getQaQcState: builder.query<QaQcStateResponse, void>({
      query: () => ({
        url: "/qa_qc/state",
        method: "GET"
      }),
      providesTags: ["QaQcState"]
    }),
    getQaQcStateSummary: builder.query<QaQcStateSummaryResponse, void>({
      query: () => ({
        url: "/qa_qc/state_summary",
        method: "GET"
      }),
      providesTags: ["QaQcStateSummary"]
    }),
    getQaQcHistory: builder.query<QaQcHistoryResponse, { hours: number }>({
      query: ({ hours }) => ({
        url: "/qa_qc/history",
        method: "GET",
        params: { hours }
      }),
      transformResponse: (response: any): QaQcHistoryResponse => {
        // Normalize to a consistent results[] shape
        if (response?.results && Array.isArray(response.results)) {
          return response as QaQcHistoryResponse;
        }
        return {
          results: [],
          count: response?.count ?? 0,
          hours: response?.hours ?? 0
        } as QaQcHistoryResponse;
      },
      providesTags: ["QaQcHistory"]
    })
  })
});

export type FailedComponent = {
  tank_type: string;
  step_type: string;
  linearity_pct: number | null;
  compound_name: string;
  compound_id: number;
  measured_value: number;
  target_value: number;
  calculated_value: number | null;
};

export type QaQcStateResponse = {
  state: string;
  qa_qc_passed: boolean;
  last_update: number;
  missing_components?: string[];
  failed_components?: FailedComponent[];
};

export type QaQcStateSummaryResponse = any;

export type QaQcHistoryItem = {
  time: string;
  job_id: string;
  overall_pass: boolean;
  step_type: string;
  tank_type: string;
  recipe_name?: string;
  qa_qc_result?: string; // JSON string (array)
};

export type QaQcHistoryResponse = {
  results: QaQcHistoryItem[];
  count: number;
  hours: number;
};

export const {
  useGetQaQcStateQuery,
  useGetQaQcStateSummaryQuery,
  useGetQaQcHistoryQuery
} = qaqcDataApi;
