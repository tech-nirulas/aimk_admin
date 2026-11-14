import { VariantMaster } from "@/interfaces/variant-master.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VariantMasterState {
  selectedMaster: VariantMaster | null;
  managingMaster: VariantMaster | null;
}

const initialState: VariantMasterState = {
  selectedMaster: null,
  managingMaster: null,
};

export const variantMasterSlice = createSlice({
  name: "variantMaster",
  initialState,
  reducers: {
    setSelectedMaster: (state, action: PayloadAction<VariantMaster | null>) => {
      state.selectedMaster = action.payload;
    },
    clearSelectedMaster: (state) => {
      state.selectedMaster = null;
    },
    setManagingMaster: (state, action: PayloadAction<VariantMaster | null>) => {
      state.managingMaster = action.payload;
    },
    clearManagingMaster: (state) => {
      state.managingMaster = null;
    },
  },
});

export const {
  setSelectedMaster,
  clearSelectedMaster,
  setManagingMaster,
  clearManagingMaster,
} = variantMasterSlice.actions;

export default variantMasterSlice.reducer;
