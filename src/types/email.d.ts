export interface BookingCompletedEmailParams {
  bookingId: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  pickupTime: string;
  totalPrice: string;
  tenantName: string;
  phone: string;
  vehicle: string;
  email: string;
}
