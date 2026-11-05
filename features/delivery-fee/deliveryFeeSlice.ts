import { createSlice } from "@reduxjs/toolkit";
import { deliveryFeeApiService } from "./deliveryFeeApiService";

const initialState = {
  selectedRule: null,
  status: "idle",
  error: null,
};

const deliveryFeeSlice = createSlice({
  name: "deliveryFee",
  initialState,
  reducers: {
    clearSelectedRule(state) {
      state.selectedRule = null;
    },
    setSelectedRule(state, action) {
      state.selectedRule = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        deliveryFeeApiService.endpoints.updateDeliveryFeeRule.matchFulfilled,
        (state) => {
          state.status = "succeeded";
        }
      )
      .addMatcher(
        deliveryFeeApiService.endpoints.createDeliveryFeeRule.matchFulfilled,
        (state) => {
          state.status = "succeeded";
        }
      );
  },
});

export const { clearSelectedRule, setSelectedRule } = deliveryFeeSlice.actions;
export default deliveryFeeSlice.reducer;
