export interface DashboardOverview {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  activeCustomers: number;
  activeOutlets: number;
}

export interface TopProductItem {
  product: {
    id: string;
    name: string;
    sku?: string | null;
    mainImage?: { key: string } | null;
  };
  quantitySold: number;
  totalRevenue: number;
}

export interface DashboardMetricsResponse {
  overview: DashboardOverview;
  topProducts: TopProductItem[];
}
