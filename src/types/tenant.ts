export interface TenantExtra {
  id?: string;
  name?: string;
  price?: number;
  coverageAmount?: number;
  quantity?: number;
  type: 'insurance' | 'service' | 'equipment';
  [key: string]: unknown;
}
