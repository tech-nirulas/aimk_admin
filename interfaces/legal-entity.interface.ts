import { RootPaginate } from "./pagination.interface";
import { Root } from "./root.interface";

export interface LegalEntity {
  id: string;
  name: string;
  legalName: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactEmail: string;
  contactPhone: string;
  isDefault: boolean;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GetLegalEntitiesResponse = Root<LegalEntity[]>;
export type GetLegalEntityResponse = Root<LegalEntity>;
export type PaginatedLegalEntitiesResponse = RootPaginate<LegalEntity>;

export type CreateLegalEntityPayload = Omit<
  LegalEntity,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateLegalEntityPayload = Partial<LegalEntity>;
