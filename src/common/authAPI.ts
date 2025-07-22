import { protectedBaseQuery } from "@/common/ProtectedBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

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

const authBaseURL = import.meta.env.VITE_KEYCLOAK_URL as string;
const realms = import.meta.env.VITE_KEYCLOAK_REALMS as string;
const client_id = import.meta.env.VITE_KEYCLOAK_CLIENTID as string;
const client_secret = import.meta.env.VITE_AUTH_CLIENT_SECRET as string;

const authURL = `${authBaseURL}/realms/${realms}/protocol/openid-connect`;

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

    getUserInfo: builder.query({
      query: () => "/userinfo",
      transformResponse: (response: UserIdentity) => {
        return response;
      }
    })
  })
});

export const { useLoginMutation, useGetUserInfoQuery } = authApi;
