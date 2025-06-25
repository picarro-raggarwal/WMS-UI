import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { WindData } from "../types";

interface WindRoseParams {
  start: number;
  end: number;
  downsample_data?: boolean;
}

export const dataReviewApi = createApi({
  reducerPath: "dataReviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/fenceline_data/api/v1",
  }),
  tagTypes: ["WindRose"],
  endpoints: (builder) => ({
    getWindRose: builder.query<WindData, WindRoseParams>({
      query: ({ start, end, downsample_data }) => ({
        url: "/wind_rose",
        params: {
          start,
          end,
          downsample_data,
        },
      }),
      transformResponse: (response: { result: WindData }) => response.result,
      providesTags: ["WindRose"],
    }),
  }),
});

export const { useGetWindRoseQuery } = dataReviewApi;
