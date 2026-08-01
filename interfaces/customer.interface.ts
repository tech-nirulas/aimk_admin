export interface CustomerAddress {
  id: string;
  tag?: string | null;
  street: string;
  city: string;
  pincode: string;
  state?: string | null;
  isDefault?: boolean;
}

export interface CustomerOrder {
  id: string;
  orderNumber?: string | null;
  status: string;
  grandTotal: number | string;
  placedAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  loyaltyPoints: number;
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    phone?: string | null;
  };
  totalOrders: number;
  lifetimeSpend: number;
  lastOrderAt?: string | null;
  addresses?: CustomerAddress[];
  orders?: CustomerOrder[];
}
