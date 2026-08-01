export interface InventoryBatch {
  id: string;
  batchNumber: string;
  productId: string;
  outletId: string;
  quantity: number;
  producedAt: string;
  expiresAt: string;
  storageLocation?: string | null;
  status: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    mainImage?: { key: string } | null;
  } | null;
  outlet?: {
    id: string;
    name: string;
    code: string;
  } | null;
}
