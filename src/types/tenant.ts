export interface TenantExtra {
  id?: string;
  name?: string;
  price?: number;
  coverageAmount?: number;
  quantity?: number;
  type: 'Insurance' | 'Service' | 'Equipment';
  [key: string]: unknown;
}
