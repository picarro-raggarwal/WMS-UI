import { protectedBaseQuery } from "@/common/ProtectedBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface AnalyzerInfo {
  model: string;
  serial_number: string;
  hw_version: string | null;
  sw_version: string;
}

export interface SystemInfoResponse {
  model: string;
  serial_number: string;
  version: string;
  ups: string | null;
  voc_zero: string | null;
  port_count: number;
  analyzer_count: number;
  analyzers: AnalyzerInfo[];
}

export const systemInfoApi = createApi({
  reducerPath: "systemInfoApi",
  baseQuery: protectedBaseQuery("/api/system_status/api/v2"),
  endpoints: (builder) => ({
    getSystemInfo: builder.query<SystemInfoResponse, void>({
      query: () => "/about_info"
    })
  })
});

export const { useGetSystemInfoQuery } = systemInfoApi;
