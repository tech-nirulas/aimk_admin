import { Root } from "./root.interface";

export type DietaryStatus = "VEG" | "NON_VEG" | "EGG";

export interface ModifierOption {
  id: string;
  modifierGroupId: string;
  name: string;
  price: number | string;
  isDefault: boolean;
  inStock: boolean;
  dietaryStatus: DietaryStatus;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModifierGroup {
  id: string;
  name: string;
  displayName: string;
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  brandId?: string | null;
  options: ModifierOption[];
  products?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateModifierOptionPayload {
  id?: string;
  name: string;
  price: number;
  isDefault?: boolean;
  inStock?: boolean;
  dietaryStatus?: DietaryStatus;
  displayOrder?: number;
}

export interface CreateModifierGroupPayload {
  name: string;
  displayName: string;
  minSelections: number;
  maxSelections: number;
  isRequired?: boolean;
  brandId?: string | null;
  options: CreateModifierOptionPayload[];
}

export interface UpdateModifierGroupPayload {
  name?: string;
  displayName?: string;
  minSelections?: number;
  maxSelections?: number;
  isRequired?: boolean;
  brandId?: string | null;
  options?: CreateModifierOptionPayload[];
}

export type GetModifierGroupsResponse = Root<ModifierGroup[]>;
export type GetModifierGroupResponse = Root<ModifierGroup>;
