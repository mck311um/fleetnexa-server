type EmailTemplate =
  | 'WelcomeTemplate'
  | 'BookingConfirmation'
  | 'BookingCompleted'
  | 'NewUser'
  | 'PasswordReset'
  | 'VerifyBusinessEmail'
  | 'BookingDocuments'
  | 'NewBooking'
  | 'PasswordRequestStorefront';

export interface SendEmailParams {
  to: string[];
  cc?: string[];
  template: EmailTemplate;
  templateData:
    | WelcomeEmailParams
    | BookingConfirmationEmailParams
    | BookingCompletedEmailParams
    | BookingDocumentsEmailParams
    | VerifyBusinessEmailParams
    | PasswordResetEmailParams;
  from?: string;
}

export interface PasswordResetEmailParams {
  verificationCode: string;
}

export interface EmailTemplateParams {
  name: string;
  subject: string;
  text?: string;
}

export interface WelcomeEmailParams {
  name: string;
  tenantName: string;
  username: string;
}

export interface BookingConfirmationEmailParams {
  bookingId: string;
  startDate: string;
  endDate: string;
  pickupTime: string;
  pickupLocation: string;
  totalPrice: string;
  tenantName: string;
  phone: string;
  vehicle: string;
  email: string;
  invoiceUrl?: string;
  agreementUrl?: string;
}

export interface BookingDocumentsEmailParams {
  bookingId: string;
  startDate: string;
  endDate: string;
  pickupTime: string;
  pickupLocation: string;
  totalPrice: string;
  tenantName: string;
  phone: string;
  vehicle: string;
  email: string;
  invoiceUrl?: string;
  agreementUrl?: string;
}

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

export interface VerifyBusinessEmailParams {
  tenantName: string;
  email: string;
  verificationCode: string;
  timestamp: string;
}
