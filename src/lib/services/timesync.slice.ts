import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface TimeSyncResponse {
  datetime: string;
  timezone: string;
  epoch: number;
}

export const timeSyncApi = createApi({
  reducerPath: "timeSyncApi",
  baseQuery: protectedBaseQuery(
    import.meta.env.VITE_WMS_TIMESYNC_API_BASE_URL || "/wms-api/timesync/api/v1"
  ),
  endpoints: (builder) => ({
    getTime: builder.query<TimeSyncResponse, void>({
      query: () => "/time"
    })
  })
});

export const { useGetTimeQuery } = timeSyncApi;
