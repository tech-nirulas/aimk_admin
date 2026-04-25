import { authApiService } from "@/features/auth/authApiService";
import { categoryApiService } from "@/features/categories/categoriesApiService";
import { mediaApiService } from "@/features/media/mediaApiService";
import { productApiService } from "@/features/products/productApiService";
import { legalEntityApiService } from "@/features/legal-entity/legalEntitiesApiService";
import { outletApiService } from "@/features/outlets/outletsApiService";
import { orderApiService } from "@/features/order/orderApiService";
import { paymentApiService } from "@/features/payments/paymentApiService";
import { brandApiService } from "@/features/brand/brandApiService";

export const api = {
  categoryApiService,
  productApiService,
  authApiService,
  mediaApiService,
  legalEntityApiService,
  outletApiService,
  orderApiService,
  paymentApiService,
  brandApiService,
};
