import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";
import { generateMockSpeciesThresholdsData } from "./species-threshold-mock-data";
import {
  SpeciesThresholdsResponse,
  SpeciesThresholdUpdateRequest
} from "./thresholds.types";

export const thresholdsApi = createApi({
  reducerPath: "thresholdsApi",
  baseQuery: protectedBaseQuery("/api/fenceline_data/api/v1"),
  tagTypes: ["SpeciesThresholds"],
  endpoints: (builder) => ({
    getAllSpeciesThresholds: builder.query<SpeciesThresholdsResponse, void>({
      providesTags: ["SpeciesThresholds"],
      async queryFn() {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: generateMockSpeciesThresholdsData() };
      }
      // query: () => "/get_all_species_thresholds",
      // transformResponse: (response: SpeciesThresholdsResponse) => {
      //   return response;
      // }
    }),

    setAllSpeciesThresholds: builder.mutation<
      SpeciesThresholdsResponse,
      SpeciesThresholdUpdateRequest
    >({
      invalidatesTags: ["SpeciesThresholds"],
      async queryFn(body) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { data: body };
      }
    })
  })
});

export const {
  useGetAllSpeciesThresholdsQuery,
  useSetAllSpeciesThresholdsMutation
} = thresholdsApi;
