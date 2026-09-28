import { Category } from "./category.interface";
import { Media } from "./media.interface";
import { RootPaginate } from "./pagination.interface";
import { Root } from "./root.interface";

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  code: string;
  baseUnit: string;
  basePrice: string;
  availableUnits: object;
  hsnCode: string;
  gstRate: string;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  preorderEnabled: boolean;
  preorderLeadDays: number;
  weight: string;
  weightUnit: string;
  piecesPerPack: number;
  shelfLife: number;
  storageInstructions: string;
  dietaryTags: string[];
  allergenInfo: object;
  nutritionalInfo: object;
  mainImageId: string;
  thumbnailId: string;
  rating: string;
  totalReviews: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  isSeasonal: boolean;
  availableFrom: string;
  availableUntil: string;
  maxPerOrder: number;
  seoTitle: string;
  seoDescription: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
  tags: string[];
  favoriteOf: any[];
  inventoryBatches: any[];
  orderItems: any[];
  reviews: any[];
  gallery: Media[];
  mainImage: Media;
  thumbnail: Media;
  variants?: ProductVariant[];
  modifierGroups?: ProductModifierGroup[];
  crossBrandUpsells?: CrossBrandUpsell[];
  brandId?: string | null;
  _count: Count;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  weight?: number | null;
  weightUnit?: string | null;
  isDefault: boolean;
  inStock: boolean;
  stockQuantity: number;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductModifierGroup {
  id: string;
  productId: string;
  modifierGroupId: string;
  displayOrder: number;
  modifierGroup?: import("./modifier.interface").ModifierGroup;
}

export interface CrossBrandUpsell {
  id: string;
  sourceProductId: string;
  targetProductId: string;
  customTitle?: string | null;
  discountPrice?: number | string | null;
  displayOrder: number;
  isActive: boolean;
  targetProduct?: Product;
}

export interface Count {
  favoriteOf: number;
  inventoryBatches: number;
  orderItems: number;
  reviews: number;
  tags: number;
}

export type GetProductsResponse = Root<Product[]>;
export type GetProductResponse = Root<Product>;
export type PaginatedProductsResponse = RootPaginate<Product>;

export type CreateProductPayload = {
  name: string;
  description: string;
  shortDescription: string;
  code: string;
  baseUnit: string;
  basePrice: string | number;
  availableUnits: object;
  hsnCode: string;
  gstRate: string | number;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  preorderEnabled: boolean;
  preorderLeadDays: number;
  weight: string | number;
  weightUnit: string;
  piecesPerPack: number;
  shelfLife: number;
  storageInstructions: string;
  dietaryTags: string[];
  allergenInfo: object;
  nutritionalInfo: object;
  mainImageId: string;
  thumbnailId: string;
  rating?: string;
  totalReviews?: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  isSeasonal: boolean;
  availableFrom: string;
  availableUntil: string;
  maxPerOrder: number;
  seoTitle: string;
  seoDescription: string;
  categoryId: string;
  brandId?: string;
  tags?: string[];
  gallery?: string[];
  variants?: Array<{
    id?: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    weight?: number;
    weightUnit?: string;
    isDefault?: boolean;
    inStock?: boolean;
    stockQuantity?: number;
    sku?: string;
    displayOrder?: number;
  }>;
  modifierGroupIds?: string[];
  crossBrandUpsells?: Array<{
    id?: string;
    targetProductId: string;
    customTitle?: string;
    discountPrice?: number;
    displayOrder?: number;
    isActive?: boolean;
  }>;
};
