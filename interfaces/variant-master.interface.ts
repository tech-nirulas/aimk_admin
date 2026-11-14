export type VariantCategory =
  | 'WEIGHT'
  | 'SCOOP'
  | 'PORTION'
  | 'PACK_SIZE'
  | 'VOLUME'
  | 'CUSTOM';

export interface VariantMaster {
  id: string;
  name: string;
  code: string;
  category: VariantCategory;
  defaultWeight: number | null;
  defaultWeightUnit: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  brandId: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    productVariants: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LinkedProductVariant {
  productVariantId: string;
  productId: string;
  productName: string;
  productSku: string;
  productBasePrice: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  mainImage?: {
    id: string;
    url?: string;
    key?: string;
  } | null;
  variantName: string;
  price: number;
  compareAtPrice: number | null;
  weight: number | null;
  weightUnit: string | null;
  isDefault: boolean;
  inStock: boolean;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantMasterPayload {
  name: string;
  code: string;
  category: VariantCategory;
  defaultWeight?: number | null;
  defaultWeightUnit?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  brandId?: string | null;
}

export interface UpdateVariantMasterPayload extends Partial<CreateVariantMasterPayload> {}

export interface ProductAssignmentItem {
  productId: string;
  price?: number;
  compareAtPrice?: number;
  isDefault?: boolean;
  inStock?: boolean;
}

export interface AssignProductsPayload {
  assignments: ProductAssignmentItem[];
}

export interface UpdateVariantMasterProductPayload {
  price?: number;
  compareAtPrice?: number;
  isDefault?: boolean;
  inStock?: boolean;
}
