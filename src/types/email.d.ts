export interface BookingCompletedEmailDto {
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

export interface NewBookingEmailDto {
  bookingId: string;
  bookingDate: string;
  vehicle: string;
  totalPrice: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  driverLicense: string;
  customerAddress: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  pickupTime: string;
  returnTime: string;
  returnLocation: string;
  rentalDuration: string;
  vehiclePrice: string;
  additionsTotal: string;
  securityDeposit: string;
}

interface BookingAddition {
  name: string;
  quantity: number;
  price: string;
  total: string;
}
