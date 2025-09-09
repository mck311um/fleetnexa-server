export interface ShopDMWebhook {
  id: string;
  event: string;
  created_at: number;
  api_version: string;
  merchant_id: string;
  live: boolean;
  data: ShopDMPaymentData;
}

interface ShopDMPaymentData {
  object_type: string;
  object_id: string;
  reference: string;
  currency: string;
  amount_in_currency: number;
  amount_xcd: number;
  reason: string;
  fee_data: ShopDMFeeData;
}

interface ShopDMFeeData {
  customer_fee_xcd: number;
  merchant_fee_xcd: number;
}
