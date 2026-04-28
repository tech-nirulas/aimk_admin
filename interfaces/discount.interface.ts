import { Brand } from "./brand.interface";
import { Category } from "./category.interface";
import { RootPaginate } from "./pagination.interface";
import { Product } from "./product.interface";
import { Root } from "./root.interface";

export interface Discount {
  id: string;
  name: string;
  description: string;
  type: string;
  value: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  discountOnAll: boolean;
  excludedProducts: Product[];
  excludedCategories: Category[];
  excludedBrands: Brand[];
}

export type GetDiscountResponse = Root<Discount>;
export type GetAllDiscountsResponse = Root<Discount[]>;
export type PaginatedDiscountsResponse = RootPaginate<Discount>;

export interface DiscountPayloadBase {
  name: string;
  description?: string;
  type: string;
  value: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  priority?: number;

  products?: string[];
  categories?: string[];
  brands?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  excludedBrands?: string[];
  discountOnAll?: boolean;
}

export type UpdateDiscountPayload = Partial<DiscountPayloadBase>;
