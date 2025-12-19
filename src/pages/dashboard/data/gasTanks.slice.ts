import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";

type GasTank = {
  gas_tank_name: string;
  last_replaced_by: string;
  last_replaced_time: number;
  percentage_full: number;
  max_pressure: number;
  current_pressure: number;
  tank_status: string;
  gas_tank_type: string;
};

type GasTanksResponse = {
  gas_tanks: GasTank[];
  lastFetched?: number;
};

type GasTankReplacement = {
  replaced_by: string;
  gas_tank_name: string;
  replaced_time: number;
};

// Recent Gas Tanks API Types
export type RecentGasTank = {
  gas_tank_id: number;
  tank_type: string;
  cylinder_id: string;
  production_number: number;
  certification_date: number;
  expiration_date: number;
  blend_tolerance: number;
  analytical_accuracy: number;
  replace_technician: string;
  replaced_time: number;
  active: boolean;
};

export type RecentGasTanksResponse = {
  recent_tanks: RecentGasTank[];
};

// Gas Tank Types API Types
export type GasTankTypeConcentration = {
  name: string;
  unit: string;
  default_concentration: number;
};

export type GasTankTypesResponse = {
  tank_types: Record<string, GasTankTypeConcentration[]>;
};

// Gas Tank Concentrations API Types
export type GasTankConcentration = {
  compound_name: string;
  concentration_unit: string;
  verified_concentration: number;
};

export type GasTankConcentrationsResult = {
  cylinder_id: string;
  blend_tolerance: number;
  analytical_accuracy: number;
  concentrations: GasTankConcentration[];
};

export type GasTankConcentrationsResponse = {
  result: GasTankConcentrationsResult;
};

// Updated Gas Tank Replacement API Types
export type ConcentrationData = {
  concentration_unit: string;
  verified_concentration: number;
};

export type NewGasTankReplacement = {
  cylinder_id: string;
  production_number: number;
  tank_type: string;
  certification_date: number;
  expiration_date: number;
  blend_tolerance: number;
  analytical_accuracy: number;
  replace_technician: string;
  concentrations: Record<string, ConcentrationData>;
};

export const gasTanksApi = createApi({
  reducerPath: "gasTanksApi",
  baseQuery: protectedBaseQuery(
    import.meta.env.VITE_FENCELINE_API_BASE_URL || "/api/fenceline_data/api/v1"
  ),
  tagTypes: [
    "GasTanks",
    "RecentGasTanks",
    "GasTankTypes",
    "GasTankConcentrations"
  ],
  endpoints: (builder) => ({
    getGasTanks: builder.query<GasTanksResponse, void>({
      query: () => "/gas_tank_status",
      providesTags: ["GasTanks"],
      transformResponse: (response: Omit<GasTanksResponse, "lastFetched">) => ({
        ...response,
        lastFetched: Date.now()
      })
    }),
    getRecentGasTanks: builder.query<RecentGasTank[], number>({
      query: (number) => `/recent_gas_tanks?number=${number}`,
      transformResponse: (response: RecentGasTanksResponse) =>
        response.recent_tanks,
      providesTags: ["RecentGasTanks"]
    }),
    getGasTankTypes: builder.query<GasTankTypesResponse, void>({
      query: () => "/gas_tank_types",
      providesTags: ["GasTankTypes"]
    }),
    getGasTankConcentrations: builder.query<
      GasTankConcentrationsResponse,
      number
    >({
      query: (gasTankId) => `/gas_tank_concentrations?gas_tank_id=${gasTankId}`,
      providesTags: ["GasTankConcentrations"]
    }),
    updateGasTank: builder.mutation<void, GasTankReplacement>({
      query: (replacement) => ({
        url: "/gas_tank_replaced",
        method: "PUT",
        body: replacement
      }),
      invalidatesTags: ["GasTanks"]
    }),
    replaceGasTank: builder.mutation<void, NewGasTankReplacement>({
      query: (replacement) => ({
        url: "/gas_tank_replaced",
        method: "PUT",
        body: replacement
      }),
      invalidatesTags: ["GasTanks", "RecentGasTanks"]
    })
  })
});

export const {
  useGetGasTanksQuery,
  useUpdateGasTankMutation,
  useGetRecentGasTanksQuery,
  useReplaceGasTankMutation,
  useGetGasTankTypesQuery,
  useGetGasTankConcentrationsQuery
} = gasTanksApi;
