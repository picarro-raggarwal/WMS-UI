import { protectedBaseQuery } from "@/common/ProtectedBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

type User = {
  id: string;
  username: string;
  enabled: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  access: {
    edit: boolean;
    manageGroup?: boolean;
    delete: boolean;
  };
};

type UsersResponse = {
  result: User[];
  size: number;
};

type GroupsResponse = {
  result: { id: string; name: string; path: string }[];
  size: number;
};

type CreateUserRequest = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  groups: { id: string; name: string; path: string }[];
  credentials: {
    type: string;
    temporary: boolean;
    value: string;
  };
};

export const userManagementApi = createApi({
  reducerPath: "userManagementApi",
  baseQuery: protectedBaseQuery("/wms-api/v1"),
  tagTypes: ["UsersList"],
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    // Prefix all queries with /admin

    getUsersList: builder.query<UsersResponse, void>({
      query: () => "/admin/users",
      providesTags: ["UsersList"]
    }),

    getGroupsList: builder.query<GroupsResponse, void>({
      query: () => "/admin/groups",
      providesTags: ["UsersList"]
    }),

    createUser: builder.mutation<void, CreateUserRequest>({
      query: (user) => ({
        url: "/admin/users",
        method: "POST",
        body: user
      }),
      invalidatesTags: ["UsersList"]
    }),

    getUserById: builder.query<{ result: User }, string>({
      query: (id) => `/admin/users/${id}`
      // providesTags: ["UsersList"]
    }),

    deleteUser: builder.mutation<void, { userId: string }>({
      query: ({ userId }) => ({
        url: `/admin/users/${userId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["UsersList"]
    }),

    updateUser: builder.mutation<void, { userId: string; data: User }>({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["UsersList"]
    }),

    updateUserPassword: builder.mutation<
      void,
      { userId: string; newPassword: string }
    >({
      query: ({ userId, newPassword }) => ({
        url: `/admin/users/${userId}/reset-password`,
        method: "PUT",
        body: { value: newPassword }
      }),
      invalidatesTags: ["UsersList"]
    }),

    // Prefix all queries with /profile
    getProfile: builder.query<{ result: User }, void>({
      query: () => "/profile"
      // providesTags: ["UsersList"]
    })
  })
});

export const {
  useGetUsersListQuery,
  useGetGroupsListQuery,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUpdateUserPasswordMutation,
  useGetProfileQuery
} = userManagementApi;
