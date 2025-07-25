import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthTokenResponse } from "./authAPI";

export const protectedBaseQuery = (
  baseUrl: string
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      // Get the token from localStorage
      const token = localStorage.getItem("token");

      // If we have a token, add it to the headers
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    }
  });

  const realms = import.meta.env.VITE_KEYCLOAK_REALMS as string;
  const client_id = import.meta.env.VITE_KEYCLOAK_CLIENTID as string;
  const client_secret = import.meta.env.VITE_AUTH_CLIENT_SECRET as string;

  const authURL = `/realms/${realms}/protocol/openid-connect`;

  const refreshRawBaseQuery = fetchBaseQuery({
    baseUrl: authURL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/x-www-form-urlencoded");
      return headers;
    }
  });

  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    // Handle 401 Unauthorized errors
    if (result.error && result.error.status === 401) {
      // If this is a login attempt (/token), do not reload the browser
      // let isLoginAttempt = false;
      // if (typeof args === "string") {
      //   isLoginAttempt = args === "/token";
      // } else if (typeof args === "object" && args.url) {
      //   isLoginAttempt = args.url === "/token";
      // }
      // if (isLoginAttempt) {
      //   // Do not clear auth data or reload
      //   return result;
      // }

      // Attempt to refresh the token
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const refreshArgs = {
            url: "/token",
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
              client_id: client_id,
              scope: "openid",
              client_secret: client_secret,
              grant_type: "refresh_token",
              refresh_token: refreshToken
            }).toString()
          };

          const refreshResponse = (await refreshRawBaseQuery(
            refreshArgs,
            api,
            {}
          )) as { data: AuthTokenResponse; error: any };

          // Check if the response has data and is not an error
          if ("data" in refreshResponse && refreshResponse.data) {
            const { access_token, refresh_token } =
              refreshResponse.data as AuthTokenResponse;

            // Store the new tokens
            localStorage.setItem("token", access_token);
            localStorage.setItem("refresh_token", refresh_token);

            // Retry the original request with the new token
            return await baseQuery(args, api, extraOptions);
          } else {
            clearAuthData();
          }
        } catch (refreshError) {
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    }

    return result;
  };
};

const clearAuthData = () => {
  // window.location.href = "/";
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("isAuthenticated");
};
