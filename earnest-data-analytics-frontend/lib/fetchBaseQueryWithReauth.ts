import {
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { authPath, isPublicAuthRequestPath } from "@/lib/apiPaths";
import { logout, setCredentials, type AuthState } from "@/redux/authSlice";
import type { AuthResponse } from "@/types/auth";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(api: BaseQueryApi): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}${authPath("refresh")}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return null;
        const data = (await res.json()) as AuthResponse;
        if (data.accessToken) {
          api.dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: data.user ?? null,
            }),
          );
          return data.accessToken;
        }
        return null;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const url = typeof args === "string" ? args : args.url;
    if (isPublicAuthRequestPath(url)) {
      return result;
    }

    const newToken = await refreshAccessToken(api);
    if (newToken) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};
