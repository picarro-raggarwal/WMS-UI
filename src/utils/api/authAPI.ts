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

export type PasswordUpdateRequiredResponse = {
  access_token: null;
  code: "required_update_password";
  userid: string;
};

const realms = import.meta.env.VITE_KEYCLOAK_REALMS as string;
const client_id = import.meta.env.VITE_KEYCLOAK_CLIENTID as string;
const client_secret = import.meta.env.VITE_AUTH_CLIENT_SECRET as string;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: protectedBaseQuery("/auth-api/v1/auth"),
  keepUnusedDataFor: 0,

  endpoints: (builder) => ({
    login: builder.mutation<
      AuthTokenResponse | PasswordUpdateRequiredResponse,
      LoginCredentials
    >({
      query: (credentials) => ({
        url: "/token?realm=picarro",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_id: client_id,
          scope: "openid",
          username: credentials.username,
          password: credentials.password,
          grant_type: "password",
          client_secret: client_secret
        })
      }),
      transformResponse: (response: {
        result: AuthTokenResponse | PasswordUpdateRequiredResponse;
      }) => {
        return response.result;
      }
    }),

    logout: builder.mutation<void, { refresh_token: string }>({
      query: ({ refresh_token }) => ({
        url: "/end-session-token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          __sec_auth_rt__: refresh_token
        }).toString()
      })
    }),

    requiredUpdatePassword: builder.mutation<
      void,
      { userId: string; newPassword: string }
    >({
      query: ({ userId, newPassword }) => ({
        url: `/required-update-password?realm=${realms}&userid=${userId}`,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          value: newPassword
        }).toString()
      })
    })
  })
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRequiredUpdatePasswordMutation
} = authApi;
