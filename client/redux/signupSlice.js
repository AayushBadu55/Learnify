import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userType: "",
  },
  errors: {},
};

const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
    },
    setValidationErrors: (state, action) => {
      state.errors = action.payload;
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.errors = {};
    }
  },
});

export const { updateField, setValidationErrors, resetForm } = signupSlice.actions;
export default signupSlice.reducer;