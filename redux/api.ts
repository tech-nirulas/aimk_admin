import { authApiService } from "@/features/auth/authApiService";
import { categoryApiService } from "@/features/categories/categoriesApiService";
import { mediaApiService } from "@/features/media/mediaApiService";
import { productApiService } from "@/features/products/productApiService";
import { legalEntityApiService } from "@/features/legal-entity/legalEntitiesApiService";
import { outletApiService } from "@/features/outlets/outletsApiService";
import { orderApiService } from "@/features/order/orderApiService";
import { paymentApiService } from "@/features/payments/paymentApiService";
import { brandApiService } from "@/features/brand/brandApiService";
import { discountApiService } from "@/features/discounts/discountApiService";
import { cakeApiService } from "@/features/cake-customization/cakeApiService";
import { offerApiService } from "@/features/offers/offerApiService";
import { reviewApiService } from "@/features/reviews/reviewApiService";
import { userApiService } from "@/features/users/userApiService";
import { inventoryApiService } from "@/features/inventory/inventoryApiService";
import { customerApiService } from "@/features/customers/customerApiService";
import { analyticsApiService } from "@/features/analytics/analyticsApiService";

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
  discountApiService,
  cakeApiService,
  offerApiService,
  reviewApiService,
  userApiService,
  inventoryApiService,
  customerApiService,
  analyticsApiService,
};
