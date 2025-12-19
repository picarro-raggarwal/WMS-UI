import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface ExportConcentrationParams {
  data_type?: "avg" | "time_series";
  start_time?: number;
  end_time?: number;
}

interface ExportSubcomponentsParams {
  subcomponents: string[];
  start_time?: number;
  end_time?: number;
}

interface ExportResponse {
  status: string;
  task_id: string;
  message: string;
}

interface ExportStatusResponse {
  task_id: string;
  progress: number;
  status: string;
  file_name: string | null;
  created: string;
  error: string | null;
  query_params: {
    data_type?: string;
    start_time?: number | null;
    end_time?: number | null;
    subcomponents?: string;
  };
}

interface ExportInfo {
  progress: number;
  status: string;
  file_name: string | null;
  created: string;
}

interface AllExportsResponse {
  exports: Record<string, ExportInfo>;
}

interface AvailableSubcomponentsResponse {
  available_subcomponents: string[];
}

export const dataExportApi = createApi({
  reducerPath: "dataExportApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_FENCELINE_DATA_EXPORT_API_BASE_URL ||
      "/api/fenceline_data_export/api/v1"
  }),
  tagTypes: ["Export"],
  endpoints: (builder) => ({
    exportConcentration: builder.mutation<
      ExportResponse,
      ExportConcentrationParams
    >({
      query: ({ data_type = "avg", start_time, end_time }) => {
        const body: Record<string, string | number> = { data_type };
        if (start_time !== undefined) body.start_time = start_time;
        if (end_time !== undefined) body.end_time = end_time;

        return {
          url: "/export/concentration",
          method: "POST",
          body
        };
      },
      invalidatesTags: ["Export"]
    }),
    exportSubcomponents: builder.mutation<
      ExportResponse,
      ExportSubcomponentsParams
    >({
      query: ({ subcomponents, start_time, end_time }) => {
        const body: Record<string, string | number | string[]> = {
          subcomponents
        };
        if (start_time !== undefined) body.start_time = start_time;
        if (end_time !== undefined) body.end_time = end_time;

        return {
          url: "/export/subcomponents",
          method: "POST",
          body
        };
      },
      invalidatesTags: ["Export"]
    }),
    getExportStatus: builder.query<ExportStatusResponse, { task_id: string }>({
      query: ({ task_id }) => ({
        url: `/export_status/${task_id}`
      }),
      providesTags: ["Export"]
    }),
    getAllExports: builder.query<AllExportsResponse, void>({
      query: () => ({
        url: "/all_exports"
      }),
      providesTags: ["Export"]
    }),
    downloadExportFile: builder.query<Blob, { file_name: string }>({
      query: ({ file_name }) => ({
        url: "/download_export_file",
        params: {
          file_name
        },
        responseHandler: (response) => response.blob()
      }),
      providesTags: ["Export"]
    }),
    getAvailableSubcomponents: builder.query<
      AvailableSubcomponentsResponse,
      void
    >({
      query: () => ({
        url: "/export/available_subcomponent_list"
      })
    }),
    exportQAQCData: builder.mutation<
      Blob,
      { start_time: number; end_time: number }
    >({
      query: (body) => ({
        url: "/export_qaqc_data",
        method: "POST",
        body,
        responseHandler: (response) => response.blob()
      })
    })
  })
});

export const {
  useExportConcentrationMutation,
  useExportSubcomponentsMutation,
  useGetExportStatusQuery,
  useGetAllExportsQuery,
  useDownloadExportFileQuery,
  useGetAvailableSubcomponentsQuery,
  useExportQAQCDataMutation
} = dataExportApi;
