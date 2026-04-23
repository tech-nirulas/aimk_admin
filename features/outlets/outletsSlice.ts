import { createSlice } from "@reduxjs/toolkit";
import { outletApiService } from "./outletsApiService";

const initialState = {
  outlet: null,
  outlets: null,
  selectedOutlet: null,
  status: "idle",
  error: null,
};

const outletSlice = createSlice({
  name: "outlet",
  initialState,
  reducers: {
    clearOutlet(state) {
      state.outlet = null;
    },
    clearSelectedOutlet(state) {
      state.selectedOutlet = null;
    },
    setSelectedOutlet(state, action) {
      state.selectedOutlet = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        outletApiService.endpoints.createOutlet.matchFulfilled,
        (state, action) => {
          state.outlet = action.payload;
          state.status = "succeeded";
        },
      )
      .addMatcher(
        outletApiService.endpoints.getAllOutlets.matchFulfilled,
        (state, action) => {
          state.outlets = action.payload;
        },
      )
      .addMatcher(
        outletApiService.endpoints.updateOutlet.matchFulfilled,
        (state, action) => {
          state.outlet = action.payload;
        },
      );
  },
});

export default outletSlice.reducer;

export const { clearOutlet, clearSelectedOutlet, setSelectedOutlet } =
  outletSlice.actions;
