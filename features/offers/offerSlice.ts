import { createSlice } from "@reduxjs/toolkit";
import { offerApiService } from "./offerApiService";

const initialState = {
  offer: null,
  offers: null,
  selectedOffer: null,
  status: "idle",
  error: null,
};

const offerSlice = createSlice({
  name: "offer",
  initialState,
  reducers: {
    clearOffer(state) {
      state.offer = null;
    },
    clearSelectedOffer(state) {
      state.selectedOffer = null;
    },
    setSelectedOffer(state, action) {
      state.selectedOffer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        offerApiService.endpoints.createOffer.matchFulfilled,
        (state, action) => {
          state.offer = action.payload;
          state.status = "succeeded";
        }
      )
      .addMatcher(
        offerApiService.endpoints.getOffers.matchFulfilled,
        (state, action) => {
          state.offers = action.payload;
        }
      )
      .addMatcher(
        offerApiService.endpoints.updateOffer.matchFulfilled,
        (state, action) => {
          state.offers = action.payload;
        }
      );
  },
});

export default offerSlice.reducer;

export const { clearOffer, clearSelectedOffer, setSelectedOffer } =
  offerSlice.actions;
