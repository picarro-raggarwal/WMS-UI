import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface SmartRecipeConfig {
  enabled: boolean;
  iteration_count: number;
}

export interface SmartRecipeConfigResponse {
  data: SmartRecipeConfig;
}

// Mock data for development
const mockConfig: SmartRecipeConfig = {
  enabled: false,
  iteration_count: 5
};

export const smartRecipeApi = createApi({
  reducerPath: "smartRecipeApi",
  baseQuery: protectedBaseQuery("/api/smart_recipe"),
  tagTypes: ["SmartRecipeConfig"],
  endpoints: (builder) => ({
    getSmartRecipeConfig: builder.query<SmartRecipeConfigResponse, void>({
      providesTags: ["SmartRecipeConfig"],
      // Mock data for development - remove this when backend is ready
      async queryFn() {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: { data: mockConfig } };
      }
    }),
    updateSmartRecipeConfig: builder.mutation<
      SmartRecipeConfigResponse,
      Partial<SmartRecipeConfig>
    >({
      invalidatesTags: ["SmartRecipeConfig"],
      // Mock data for development - remove this when backend is ready
      async queryFn(body) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Update mock data
        Object.assign(mockConfig, body);
        return { data: { data: mockConfig } };
      }
    })
  })
});

export const {
  useGetSmartRecipeConfigQuery,
  useUpdateSmartRecipeConfigMutation
} = smartRecipeApi;
