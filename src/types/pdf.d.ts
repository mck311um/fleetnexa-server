interface RentalService {
  label: string;
  description?: string;
  amount: number;
  rate?: number;
  policy?: string;
}

interface InvoiceItem {
  label: string;
  amount: number;
  description?: string;
  rate?: number;
  policy?: string;
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
  currency: string;
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
  discount: number;
  total: number;
  invoiceNotes: string;
  numberOfUnits: number;
  unitPlural: string;
  unit: string;
}

interface RentalAgreementData {
  tenantName: string;
  street: string;
  village: string;
  parish: string;
  country: string;
  email: string;
  phone: string;
  agreementNumber: string;
  agreementDate: string;
  make: string;
  model: string;
  plate: string;
  bodyType: string;
  transmission: string;
  color: string;
  year: number;
  fuelPercent: string;
  mileage: string;
  fuel: string;
  drive: string;
  featuredImage: string;
  pickupDate: string;
  pickupLocation: string;
  pickupTime: string;
  returnDate: string;
  returnLocation: string;
  returnTime: string;
  numberOfUnits: number;
  unit: string;
  unitPlural: string;
  basePrice: number;
  rentalAmount: number;
  services: RentalService[];
  extrasTotal: number;
  securityDeposit: number;
  total: number;
  currency: string;
  minimumDays: number;
  bookingMinimumDays: number;
  cancellationText: string;
  lateAmount: number;
  maxHours: number;
  dailyRate: number;
  drivers?: RentalAgreementDriver[];
  discount: number;
  discountAmount: number;
}

interface AgreementData {
  tenantName: string;
  street: string;
  village: string;
  parish: string;
  country: string;
  email: string;
  phone: string;
  agreementNumber: string;
  agreementDate: string;
  make: string;
  model: string;
  plate: string;
  bodyType: string;
  transmission: string;
  color: string;
  year: number;
  fuelPercent: string;
  mileage: string;
  fuel: string;
  drive: string;
  featuredImage: string;
  pickupDate: string;
  pickupLocation: string;
  pickupTime: string;
  returnDate: string;
  returnLocation: string;
  returnTime: string;
  numberOfUnits: number;
  unit: string;
  unitPlural: string;
  basePrice: number;
  rentalAmount: number;
  services: RentalService[];
  extrasTotal: number;
  securityDeposit: number;
  total: number;
  currency: string;
  minimumDays: number;
  bookingMinimumDays: number;
  cancellationText: string;
  lateAmount: number;
  maxHours: number;
  dailyRate: number;
  drivers?: RentalAgreementDriver[];
}

interface RentalAgreementDriver {
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  license: string;
  issuedDate: string;
  expiryDate: string;
  city: string;
  country: string;
  address: string;
  email: string;
  phone: string;
  primaryDriver: boolean;
}
