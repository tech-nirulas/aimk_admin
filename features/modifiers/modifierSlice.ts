import { ModifierGroup } from "@/interfaces/modifier.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModifierState {
  selectedModifier: ModifierGroup | null;
}

const initialState: ModifierState = {
  selectedModifier: null,
};

export const modifierSlice = createSlice({
  name: "modifier",
  initialState,
  reducers: {
    setSelectedModifier: (state, action: PayloadAction<ModifierGroup | null>) => {
      state.selectedModifier = action.payload;
    },
    clearSelectedModifier: (state) => {
      state.selectedModifier = null;
    },
  },
});

export const { setSelectedModifier, clearSelectedModifier } = modifierSlice.actions;
export default modifierSlice.reducer;
