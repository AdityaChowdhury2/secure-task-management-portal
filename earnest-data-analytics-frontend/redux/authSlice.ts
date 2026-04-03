import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/auth";

export type AuthState = {
  accessToken: string | null;
  user: User | null;
  sessionChecked: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  sessionChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user: User | null }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user ?? null;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
    },
    setSessionChecked: (state, action: PayloadAction<boolean>) => {
      state.sessionChecked = action.payload;
    },
  },
});

export const { setCredentials, logout, setSessionChecked } = authSlice.actions;
export default authSlice.reducer;
