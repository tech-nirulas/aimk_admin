import { Media } from "./media.interface";
import { RootPaginate } from "./pagination.interface";
import { Root } from "./root.interface";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryImageId: string;
  displayOrder: number;
  isActive: boolean;
  parentId: string;
  typicalConsumption: string;
  preparationTime: string;
  defaultGstRate: number;
  createdAt: string;
  updatedAt: string;
  categoryImage: Media;
  _count: object
}

export type GetCategoryWithSkuCountResponse = Category[];
export type GetCategoryResponse = Root<Category>;
export type GetAllCategoriesResponse = Root<Category[]>;
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
>;
