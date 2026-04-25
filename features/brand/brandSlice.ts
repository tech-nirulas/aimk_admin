// src/features/categories/categorySlice.ts

import { createSlice } from "@reduxjs/toolkit";
import { brandApiService } from "./brandApiService";

const initialState = {
  brand: null,
  brands: null,
  selectedBrand: null,
  status: "idle",
  error: null,
};

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    clearBrand(state) {
      state.brand = null;
    },
    clearSelectedBrand(state) {
      state.selectedBrand = null;
    },
    setSelectedBrand(state, action) {
      state.selectedBrand = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        brandApiService.endpoints.createBrand.matchFulfilled,
        (state, action) => {
          state.brand = action.payload;
          state.status = "succeeded";
        }
      )
      .addMatcher(
        brandApiService.endpoints.getAllBrands.matchFulfilled,
        (state, action) => {
          state.brands = action.payload;
        }
      )
      .addMatcher(
        brandApiService.endpoints.updateBrand.matchFulfilled,
        (state, action) => {
          state.brand = action.payload;
        }
      );
  },
});

export default brandSlice.reducer;

export const {
  clearBrand,
  clearSelectedBrand,
  setSelectedBrand,
} = brandSlice.actions;