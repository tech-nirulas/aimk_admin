import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import categoryReducer from "@/features/categories/categorySlice";
import productReducer from "@/features/products/productSlice";
import legalEntityReducer from "@/features/legal-entity/legalEntitiesSlice";
import outletReducer from "@/features/outlets/outletsSlice";
import brandReducer from "@/features/brand/brandSlice";

export const reducer = {
  cartReducer,
  categoryReducer,
  productReducer,
  authReducer,
  legalEntityReducer,
  outletReducer,
  brandReducer,
};
