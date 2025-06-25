import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface TimeSyncResponse {
  datetime: string;
  timezone: string;
  epoch: number;
}

export const timeSyncApi = createApi({
  reducerPath: "timeSyncApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/timesync/api/v1",
  }),
  endpoints: (builder) => ({
    getTime: builder.query<TimeSyncResponse, void>({
      query: () => "/time",
    }),
  }),
});

export const { useGetTimeQuery } = timeSyncApi;
