import { protectedBaseQuery } from "@/common/ProtectedBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

interface SystemStatus {
  system_status: Record<string, unknown>;
  overall_status: {
    status: string;
    faulty_components: string[];
  };
  lastFetched?: number;
}

export const systemStatusApi = createApi({
  reducerPath: "systemStatusApi",
  baseQuery: protectedBaseQuery("/api/fenceline_data/api/v1"),
  tagTypes: ["SystemStatus"],
  endpoints: (builder) => ({
    getSystemStatus: builder.query<SystemStatus, void>({
      query: () => "/system_status",
      providesTags: ["SystemStatus"],
      transformResponse: (response: Omit<SystemStatus, "lastFetched">) => ({
        ...response,
        lastFetched: Date.now()
      })
    })
  })
});

export const { useGetSystemStatusQuery } = systemStatusApi;
