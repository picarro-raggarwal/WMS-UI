import { createApi } from "@reduxjs/toolkit/query/react";
import { protectedBaseQuery } from "./ProtectedBaseQuery";

export interface LoginCredentials {
  username: string;
  password: string;
  refresh_token?: string;
}

export type AuthTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token: string;
  "not-before-policy": number;
  session_state: string;
  scope: string;
};

interface UserIdentity {
  sub: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

const realms = import.meta.env.VITE_KEYCLOAK_REALMS as string;
const client_id = import.meta.env.VITE_KEYCLOAK_CLIENTID as string;
const client_secret = import.meta.env.VITE_AUTH_CLIENT_SECRET as string;

const authURL = `/realms/${realms}/protocol/openid-connect`;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: protectedBaseQuery(authURL), // "http://slim100-beta.corp.picarro.com:8080/realms/picarro/protocol/openid-connect"
  keepUnusedDataFor: 0,

  endpoints: (builder) => ({
    login: builder.mutation<AuthTokenResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: client_id,
          scope: "openid",
          username: credentials.username,
          password: credentials.password,
          grant_type: "password",
          client_secret: client_secret
        }).toString()
      })
    }),

    logout: builder.mutation<void, { refresh_token: string }>({
      query: ({ refresh_token }) => ({
        url: "/logout",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: client_id,
          client_secret: client_secret,
          refresh_token
        }).toString()
      })
    }),

    getUserInfo: builder.query({
      query: () => "/userinfo",
      transformResponse: (response: UserIdentity) => {
        return response;
      }
    }),

    getUsers: builder.query<any[], void>({
      query: () => ({
        url: `/admin/realms/${realms}/users`,
        method: "GET"
      })
    }),

    deleteUser: builder.mutation<void, { userId: string }>({
      query: ({ userId }) => ({
        url: `/admin/realms/${realms}/users/${userId}`,
        method: "DELETE"
      })
    }),

    updateUser: builder.mutation<void, { userId: string; data: any }>({
      query: ({ userId, data }) => ({
        url: `/admin/realms/${realms}/users/${userId}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
    })
  })
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetUserInfoQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation
} = authApi;
