import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface RecipeStep {
  recipe_step_id: number;
  recipe_row_id: number;
  step_id: number;
  duration: number;
  sequence: number;
}

export interface Recipe {
  recipe_row_id: number;
  recipe_id: number;
  version_id: number;
  duration: number;
  recipe_name: string;
  created_at: number; // Unix timestamp
  steps?: RecipeStep[];
}

export interface RecipeResponse {
  result: Recipe[];
}

export interface CreateRecipeRequest {
  recipe_name: string;
  version_id: number;
  recipe_duration: number;
  steps?: {
    step_id: number;
    step_duration: number;
    step_sequence: number;
  }[];
}

export interface Step {
  step_id: number;
  name: string;
  config: {
    port_1: boolean;
    port_2: boolean;
    port_3: boolean;
    port_4: boolean;
    port_5: boolean;
    mfc_A_setpoint: number;
    mfc_B_setpoint: number;
    mfc_C_setpoint: number;
    mfc_D_setpoint: number;
    bit_mask: number;
  };
}

export interface StepResponse {
  result: Step[];
}

export interface UpdateRecipeRequest {
  recipe_row_id: number;
  recipe_name: string;
  version_id: number;
  recipe_duration: number;
  steps?: {
    step_id: number;
    step_duration: number;
    step_sequence: number;
  }[];
}

export interface DeleteRecipeRequest {
  id: number;
  name: string;
}

export const recipesApi = createApi({
  reducerPath: "recipesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/fenceline_recipes/api/v1",
  }),
  tagTypes: ["Recipe", "Step"],
  endpoints: (builder) => ({
    getAllRecipes: builder.query<Recipe[], void>({
      query: () => "/get_all_recipes?include_steps=true",
      transformResponse: (response: RecipeResponse) => response.result,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ recipe_row_id }) => ({
                type: "Recipe" as const,
                id: recipe_row_id.toString(),
              })),
              { type: "Recipe", id: "LIST" },
            ]
          : [{ type: "Recipe", id: "LIST" }],
    }),

    getAllSteps: builder.query<Step[], void>({
      query: () => "/get_all_steps?include_config=true",
      transformResponse: (response: StepResponse) => response.result,
      providesTags: [{ type: "Step", id: "LIST" }],
    }),

    getRecipeById: builder.query<Recipe, number>({
      query: (id) => `/get_recipe/${id}?include_steps=true`,
      transformResponse: (response: { result: Recipe }) => response.result,
      providesTags: (result, error, id) => [{ type: "Recipe", id: id.toString() }],
    }),

    createRecipe: builder.mutation<Recipe, CreateRecipeRequest>({
      query: (recipe) => ({
        url: "/create_new_recipe",
        method: "POST",
        body: recipe,
      }),
      invalidatesTags: [{ type: "Recipe", id: "LIST" }],
    }),

    updateRecipe: builder.mutation<Recipe, UpdateRecipeRequest>({
      query: (recipe) => ({
        url: "/update_recipe",
        method: "POST",
        body: recipe,
      }),
      invalidatesTags: (result, error, { recipe_row_id }) => [
        { type: "Recipe", id: recipe_row_id.toString() },
        { type: "Recipe", id: "LIST" },
      ],
    }),

    deleteRecipe: builder.mutation<void, DeleteRecipeRequest>({
      query: (params) => ({
        url: `/delete_recipe?recipe_name=${encodeURIComponent(params.name)}`,
        method: "DELETE",
        body: {
          recipe_row_id: params.id,
        },
      }),
      invalidatesTags: (result, error, params) => [
        { type: "Recipe", id: params.id.toString() },
        { type: "Recipe", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllRecipesQuery,
  useGetRecipeByIdQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useGetAllStepsQuery,
} = recipesApi;
