type EmailTemplate =
  | "WelcomeTemplate"
  | "BookingConfirmation"
  | "BookingCompleted"
  | "NewUser"
  | "ResetPassword";

export interface SendEmailParams {
  to: string[];
  cc?: string[];
  template: EmailTemplate;
  templateData:
    | WelcomeEmailParams
    | BookingConfirmationEmailParams
    | BookingCompletedEmailParams;
  from?: string;
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
  password: string;
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
  invoiceUrl: string;
  agreementUrl: string;
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
