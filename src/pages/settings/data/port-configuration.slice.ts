import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";
import { mockPortConfigurationData } from "./port-configuration-mock-data";

export interface PortConfigurationResult {
  enabled_ports: number[];
  available_ports: number[];
}

export interface PortConfigurationResponse {
  result: PortConfigurationResult;
}

export interface PortLabel {
  portId: string;
  portLabel: string;
}

export interface PortLabelsResponse {
  result: PortLabel[];
}

export interface Inlet {
  type: "PORT" | "CLEAN" | "REFERENCE";
  name: string;
  bankId: number;
  id: number;
  zeroPort: boolean;
  isActive: number | boolean;
  available: boolean;
  label: string;
}

export interface InletsResponse {
  result: Inlet[];
}

export interface UpdatePortLabelRequest {
  bankId: number;
  inletId: number;
  label: string;
}

export interface UpdatePortLabelResponse {
  success: boolean;
  message: string;
  data: {
    bankId: number;
    inletId: number;
    label: string;
  };
}

export interface UpdatePortConfigurationRequest {
  enabled_ports: number[];
}

export interface UpdatePortConfigurationResponse {
  success: boolean;
  message: string;
}

// Main port configuration API (uses /api/system_status/api/v2)
export const portConfigurationApi = createApi({
  reducerPath: "portConfigurationApi",
  baseQuery: protectedBaseQuery("/api/system_status/api/v2"),
  tagTypes: ["PortConfiguration", "PortLabels"],
  endpoints: (builder) => ({
    getPortConfiguration: builder.query<PortConfigurationResponse, void>({
      providesTags: ["PortConfiguration"],
      async queryFn(_arg, _queryApi, _extraOptions) {
        const baseQuery = protectedBaseQuery("/api/system_status/api/v2");
        const result = await baseQuery(
          {
            url: "/port_configuration",
            method: "GET"
          },
          _queryApi,
          _extraOptions
        );

        // If API fails, return mock data
        if (result.error) {
          return { data: mockPortConfigurationData };
        }

        // Return the actual API response
        return { data: result.data as PortConfigurationResponse };
      }
    }),

    // getPortLabels: builder.query<PortLabelsResponse, void>({
    //   query: () => "/port_labels",
    //   providesTags: ["PortLabels"]
    // }),

    updatePortConfiguration: builder.mutation<
      UpdatePortConfigurationResponse,
      UpdatePortConfigurationRequest
    >({
      query: (arg) => ({
        url: "/port_configuration",
        method: "PUT",
        body: arg.enabled_ports
      }),
      invalidatesTags: ["PortConfiguration"]
    })
  })
});

// Separate API for inlets endpoints (uses /wms-api/manage_inlet/api/v2)
export const inletsApi = createApi({
  reducerPath: "inletsApi",
  baseQuery: protectedBaseQuery("/wms-api/manage_inlet/api/v2"),
  tagTypes: ["Inlets"],
  endpoints: (builder) => ({
    getInlets: builder.query<InletsResponse, void>({
      query: () => "/inlets",
      providesTags: ["Inlets"],
      transformResponse: (response: any) => {
        return {
          result: response.results || response.result || []
        } as InletsResponse;
      }
    }),

    updatePortLabel: builder.mutation<
      UpdatePortLabelResponse,
      UpdatePortLabelRequest
    >({
      query: (arg) => ({
        url: `/inlets/${arg.bankId}/${arg.inletId}/port-label`,
        method: "PUT",
        body: {
          label: arg.label
        }
      }),
      invalidatesTags: ["Inlets"]
    }),

    runEstablishFlowRate: builder.mutation<void, void>({
      query: () => ({
        url: "/inlets/flow-rates/establish",
        method: "POST"
      })
    })
    // invalidatesTags: ["Inlets"]
  })
});

// Export hooks from port configuration API
export const {
  useGetPortConfigurationQuery,
  // useGetPortLabelsQuery,
  useUpdatePortConfigurationMutation
} = portConfigurationApi;

// Export hooks from inlets API
export const {
  useGetInletsQuery,
  useUpdatePortLabelMutation,
  useRunEstablishFlowRateMutation
} = inletsApi;
