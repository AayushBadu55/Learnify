import { configureStore } from "@reduxjs/toolkit";
import signupReducer from "./signupSlice";

export const store = configureStore({
  reducer: {
    signup: signupReducer,
  },
}); 