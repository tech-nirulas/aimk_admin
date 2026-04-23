// src/features/categories/categorySlice.ts

import { createSlice } from "@reduxjs/toolkit";
import { legalEntityApiService } from "./legalEntitiesApiService";

const initialState = {
  legalEntity: null,
  legalEntities: null,
  selectedLegalEntity: null,
  status: "idle",
  error: null,
};

const legalEntitySlice = createSlice({
  name: "legalEntity",
  initialState,
  reducers: {
    clearLegalEntity(state) {
      state.legalEntity = null;
    },
    clearSelectedLegalEntity(state) {
      state.selectedLegalEntity = null;
    },
    setSelectedLegalEntity(state, action) {
      state.selectedLegalEntity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        legalEntityApiService.endpoints.createLegalEntity.matchFulfilled,
        (state, action) => {
          state.legalEntity = action.payload;
          state.status = "succeeded";
        },
      )
      .addMatcher(
        legalEntityApiService.endpoints.getAllLegalEntities.matchFulfilled,
        (state, action) => {
          state.legalEntities = action.payload;
        },
      )
      .addMatcher(
        legalEntityApiService.endpoints.updateLegalEntity.matchFulfilled,
        (state, action) => {
          state.legalEntity = action.payload;
        },
      );
  },
});

export default legalEntitySlice.reducer;

export const {
  clearLegalEntity,
  clearSelectedLegalEntity,
  setSelectedLegalEntity,
} = legalEntitySlice.actions;
