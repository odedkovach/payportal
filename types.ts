
export type TransactionStatus = 'Refunded' | 'Charged' | 'Cancelled' | 'Paid into bank' | 'Failed';

export interface Transaction {
  id: string;
  reference: string;
  notes: string | null;
  status: TransactionStatus;
  customer: string;
  customerEmail?: string;
  method: {
    type: 'Visa' | 'Mastercard';
    last4: string;
  };
  amount: number;
  fee: number;
  net: number;
  chargedOn: string;
}

export interface FilterState {
  searchQuery: string;
}

// --- Dashboard Types ---

export interface DashboardMetric {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartSegment {
  label: string;
  value: number;
  color?: string;
}

export interface BarData {
  label: string;
  value: number;
}

export interface DashboardData {
  title: string;
  metrics: DashboardMetric[];
  paymentMethodDistribution: ChartSegment[];
  topCustomers: BarData[];
}

export interface AIResponse {
  type: 'FILTER' | 'DASHBOARD' | 'DETAILS';
  filteredIds?: string[];
  dashboardData?: DashboardData;
  detailsId?: string;
}
