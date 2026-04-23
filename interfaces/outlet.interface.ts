import { LegalEntity } from "./legal-entity.interface";
import { RootPaginate } from "./pagination.interface";
import { Root } from "./root.interface";

export interface Outlet {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  openingHours: object;
  pickupCutoffTime: string;
  isActive: boolean;
  coordinates: object;
  legalEntityId: string;
  createdAt: string;
  updatedAt: string;
  legalEntity: LegalEntity;
}

export type GetOutletsResponse = Root<Outlet[]>;
export type GetOutletResponse = Root<Outlet>;
export type PaginatedOutletsResponse = RootPaginate<Outlet>;

export type CreateOutletPayload = Omit<
  Outlet,
  "id" | "isActive" | "createdAt" | "updatedAt" | "legalEntity"
>;

export type UpdateOutletPayload = Partial<CreateOutletPayload>;
