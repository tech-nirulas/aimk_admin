// store/cartSlice.ts
import { RootState } from "@/lib/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  documentId: string;
  name: string;
  price: number;
  description: string;
  slug: string;
  discount?: number | null;
  image?: { url: string; alternativeText?: string | null } | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
      const existing = state.items.find(
        (i) => i.documentId === action.payload.documentId,
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.documentId !== action.payload);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ documentId: string; quantity: number }>,
    ) => {
      const item = state.items.find(
        (i) => i.documentId === action.payload.documentId,
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) => i.documentId !== action.payload.documentId,
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },

    clearCart(state) {
      state.items = [];
    },

    openCart(state) {
      state.isOpen = true;
    },

    closeCart(state) {
      state.isOpen = false;
    },

    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────
// import type { RootState } from "./index";

export const selectCartItems = (state: RootState) => state?.cart?.items;

export const selectCartCount = (state: RootState) =>
  state?.cart?.items?.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotal = (state: RootState) =>
  state?.cart?.items?.reduce((sum, item) => {
    const effectivePrice =
      item.discount && item.discount > 0
        ? item.price * (1 - item.discount / 100)
        : item.price;
    return sum + effectivePrice * item.quantity;
  }, 0);

export const selectCartItemQuantity = (state: RootState, documentId: string) =>
  state?.cart?.items?.find((item) => item.documentId === documentId)?.quantity ||
  0;

export const selectCartIsOpen = (state: RootState) => state.cart.isOpen;
