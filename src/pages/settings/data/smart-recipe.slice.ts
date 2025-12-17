import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface SmartRecipeConfig {
  enabled: boolean;
  step_iterations: number;
}

export interface SmartRecipeConfigResponse {
  result: SmartRecipeConfig;
}

export interface UpdateSmartRecipeConfigRequest {
  enabled: boolean;
  step_iterations: number;
}

export const smartRecipeApi = createApi({
  reducerPath: "smartRecipeApi",
  baseQuery: protectedBaseQuery("/api/system_status/api/v2"),
  tagTypes: ["SmartRecipeConfig"],
  endpoints: (builder) => ({
    getSmartRecipeConfig: builder.query<SmartRecipeConfigResponse, void>({
      query: () => "/smart_recipe_settings",
      providesTags: ["SmartRecipeConfig"]
    }),

    updateSmartRecipeConfig: builder.mutation<
      SmartRecipeConfigResponse,
      UpdateSmartRecipeConfigRequest
    >({
      query: (body) => ({
        url: "/smart_recipe_settings",
        method: "PUT",
        body
      }),
      invalidatesTags: ["SmartRecipeConfig"]
    })
  })
});

export const {
  useGetSmartRecipeConfigQuery,
  useUpdateSmartRecipeConfigMutation
} = smartRecipeApi;
