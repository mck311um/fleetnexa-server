export interface RentalService {
  label: string;
  description: string;
  amount: number;
}

export interface InvoiceData {
  companyName: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  email: string;
  phone: string;
  logoUrl: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  customerPhone: string;
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  basePrice: number;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  returnLocation: string;
  rentalAmount: number;
  services: RentalService[];
  subTotal: number;
  deposit: number;
  total: number;
  invoiceNotes: string;
  numberOfUnits: number;
  unitPlural: string;
  unit: string;
}
