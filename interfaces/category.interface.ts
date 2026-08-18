import { Brand } from "./brand.interface";
import { Media } from "./media.interface";
import { RootPaginate } from "./pagination.interface";
import { Product } from "./product.interface";
import { Root } from "./root.interface";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryImageId: string | null;
  displayOrder: number;
  isActive: boolean;
  /** Parent categories only — controls appearance in the consumer Sub Navbar. */
  showInSubNavbar: boolean;
  parentId: string | null;
  typicalConsumption: string;
  preparationTime: string;
  defaultGstRate: number;
  createdAt: string;
  updatedAt: string;
  brandId: string;
  brand: Brand;
  parent: Category;
  products: Product[];
  categoryImage: Media;
  _count: {
    products: number;
  };
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export type GetCategoryWithSkuCountResponse = Category[];
export type GetCategoryResponse = Root<Category>;
export type GetAllCategoriesResponse = Root<Category[]>;
export type GetCategoryTreeResponse = Root<CategoryWithChildren[]>;
export type PaginatedCategoriesResponse = RootPaginate<Category>;

export type CreateCategoryPayload = Omit<
  Category,
  | "id"
  | "slug"
  | "updatedAt"
  | "createdAt"
  | "parent"
  | "isActive"
  | "categoryImage"
  | "products"
  | "_count"
  | "typicalConsumption"
  | "preparationTime"
  | "defaultGstRate"
>;
