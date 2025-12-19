import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  SpeciesThresholdsResponse,
  SpeciesThresholdUpdatePayload,
  SpeciesThresholdUpdateRequest
} from "./thresholds.types";

export const thresholdsApi = createApi({
  reducerPath: "thresholdsApi",
  baseQuery: protectedBaseQuery(
    import.meta.env.VITE_THRESHOLDS_API_BASE_URL || "/api/thresholds/api/v2"
  ),
  tagTypes: ["SpeciesThresholds"],
  endpoints: (builder) => ({
    getAllSpeciesThresholds: builder.query<SpeciesThresholdsResponse, void>({
      providesTags: ["SpeciesThresholds"],
      query: () => "/thresholds_model",
      transformResponse: (response: SpeciesThresholdsResponse) => {
        return response;
      }
    }),

    setAllSpeciesThresholds: builder.mutation<
      SpeciesThresholdsResponse,
      SpeciesThresholdUpdateRequest
    >({
      invalidatesTags: ["SpeciesThresholds"],
      async queryFn(body, _queryApi, _extraOptions) {
        // Transform request to only include species array
        const payload: SpeciesThresholdUpdatePayload = {
          species: body.species
        };

        // Use a separate baseQuery for the update endpoint (different base path)
        const updateBaseQuery = protectedBaseQuery("/api");
        const result = await updateBaseQuery(
          {
            url: "/thresholds/api/v0.1/update",
            method: "POST",
            body: payload
          },
          _queryApi,
          _extraOptions
        );

        if (result.error) {
          return { error: result.error };
        }

        // Return the original body as response (API might return success or the updated data)
        return { data: body };
      }
    })
  })
});

export const {
  useGetAllSpeciesThresholdsQuery,
  useSetAllSpeciesThresholdsMutation
} = thresholdsApi;
