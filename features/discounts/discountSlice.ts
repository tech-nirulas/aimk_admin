// src/features/categories/categorySlice.ts

import { createSlice } from "@reduxjs/toolkit";
import { discountApiService } from "./discountApiService";

const initialState = {
  discount: null,
  discounts: null,
  selectedDiscount: null,
  status: "idle",
  error: null,
};

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearDiscount(state) {
      state.discount = null;
    },
    clearSelectedDiscount(state) {
      state.selectedDiscount = null;
    },
    setSelectedDiscount(state, action) {
      state.selectedDiscount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        discountApiService.endpoints.createDiscount.matchFulfilled,
        (state, action) => {
          state.discount = action.payload;
          state.status = "succeeded";
        },
      )
      .addMatcher(
        discountApiService.endpoints.getAllDiscounts.matchFulfilled,
        (state, action) => {
          state.discounts = action.payload;
        },
      )
      .addMatcher(
        discountApiService.endpoints.updateDiscount.matchFulfilled,
        (state, action) => {
          state.discounts = action.payload;
        },
      );
  },
});

export default discountSlice.reducer;

export const { clearDiscount, clearSelectedDiscount, setSelectedDiscount } =
  discountSlice.actions;
