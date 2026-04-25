import { Category } from "./category.interface";
import { LegalEntity } from "./legal-entity.interface";
import { RootPaginate } from "./pagination.interface";
import { Product } from "./product.interface";
import { Root } from "./root.interface";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  legalEntityId: string;
  legalEntity?: LegalEntity;
  products?: Product[];
  categories?: Category[];
  _count?: {
    products: number;
    categories: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type GetBrandResponse = Root<Brand>;
export type GetAllBrandsResponse = Root<Brand[]>;
export type GetAllBrandsPaginatedResponse = RootPaginate<Brand[]>;

export type CreateBrandPayload = {
  name: string;
  isActive?: boolean;
  legalEntityId?: string;
};

export type UpdateBrandPayload = Partial<CreateBrandPayload>;
