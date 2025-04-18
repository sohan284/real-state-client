import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logOut, setUser } from "../fetures/auth/authSlice";
import { toast } from "sonner";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://backend.rentpadhomes.com/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", token);
    }
    return headers;
  },
});
const baseQueryWithRefreshToken = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // if (result.error.data.message === "Invalid ID") {
  //   api.dispatch(logOut());
  // }

  if (result?.error?.data.success === false) {
    toast.error(result?.error?.data.message );
  }

  if (result?.error?.data?.message === "User is not found, not decoded") {
    api.dispatch(logOut());
  }

  if (result?.error?.status === 404) {
    // toast.error(`${result?.error?.data.message}`);
  }

  if (result?.error?.status === 401) {
    const res = await fetch("https://backend.rentpadhomes.com/api/v1/auth/refresh-token", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    if (data?.data?.accessToken) {
      const user = api.getState().auth.user;
      api.dispatch(
        setUser({
          user,
          token: data.data.accessToken,
        })
      );
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: ["user", "properties", "tenants", "owner", "maintenance", "overview", "payment", "payout", "units", "review", "email", "payment-history", "contactUs"],
  endpoints: () => ({}),
});
