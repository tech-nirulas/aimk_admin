// src/features/categories/categorySlice.ts

import { createSlice } from "@reduxjs/toolkit";
import { categoryApiService } from "./categoriesApiService";

const initialState = {
  category: null,
  categories: null,
  selectedCategory: null,
  status: "idle",
  error: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearCategory(state) {
      state.category = null;
    },
    clearSelectedCategory(state) {
      state.selectedCategory = null;
    },
    setSelectedCategory(state, action) {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        categoryApiService.endpoints.createCategory.matchFulfilled,
        (state, action) => {
          state.category = action.payload;
          state.status = "succeeded";
        }
      )
      .addMatcher(
        categoryApiService.endpoints.getAllCategories.matchFulfilled,
        (state, action) => {
          state.categories = action.payload;
        }
      )
      .addMatcher(
        categoryApiService.endpoints.updateCategory.matchFulfilled,
        (state, action) => {
          state.category = action.payload;
        }
      );
  },
});

export default categorySlice.reducer;

export const {
  clearCategory,
  clearSelectedCategory,
  setSelectedCategory,
} = categorySlice.actions;