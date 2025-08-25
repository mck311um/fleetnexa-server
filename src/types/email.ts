export interface SendEmailParams {
  to: string[];
  template: string;
  templateData: WelcomeEmailParams;
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
  pickupLocation: string;
  totalPrice: string;
  tenantName: string;
  phone: string;
  email: string;
}
