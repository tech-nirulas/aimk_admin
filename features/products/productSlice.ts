// src/features/products/productSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import { productApiService } from "./productApiService";

const initialState = {
  product: null,
  products: null,
  selectedProduct: null,
  status: "idle",
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProduct(state) {
      state.product = null;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
    setSelectedProduct(state, action) {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        productApiService.endpoints.createProduct.matchFulfilled,
        (state, action) => {
          state.product = action.payload;
          state.status = "succeeded";
        },
      )
      .addMatcher(
        productApiService.endpoints.getAllProducts.matchFulfilled,
        (state, action) => {
          state.products = action.payload;
        },
      )
      .addMatcher(
        productApiService.endpoints.updateProduct.matchFulfilled,
        (state, action) => {
          state.product = action.payload;
        },
      );
  },
});

export default productSlice.reducer;

export const { clearProduct, clearSelectedProduct, setSelectedProduct } =
  productSlice.actions;
