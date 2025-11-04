"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templates = void 0;
exports.templates = [
    {
        name: 'WelcomeTemplate',
        subject: 'Welcome to FleetNexa!',
        text: 'Welcome {{name}}!\n\nThank you for joining FleetNexa.\n\nYour account:\nCompany: {{tenantName}}\nUsername: {{username}}\nPassword: {{password}}\n\nPlease change your password immediately after first login.\n\nBest regards,\nFleetNexa Team',
    },
    {
        name: 'BookingConfirmation',
        subject: 'Booking Confirmation',
        text: "Booking Confirmed!\n\nYour reservation has been successfully completed.\n\nBooking Details:\nBooking ID: {{bookingId}}\nStart Date: {{startDate}}\nEnd Date: {{endDate}}\nPickup Location: {{pickupLocation}}\nTotal Price: {{totalPrice}}\n\nRental Company:\nCompany: {{tenantName}}\nPhone: {{phone}}\nEmail: {{email}}\n\nImportant Notes:\n- Please bring a valid driver's license\n- Arrive 15 minutes before your scheduled pickup time\n- Contact the rental company if you need to make any changes with your booking ID\n\n© 2025 Devvize Services. All rights reserved.\nNeed help? Contact our team at support@devvize.com",
    },
    {
        name: 'BookingCompleted',
        subject: 'Booking Completed',
        text: "Booking Completed!\n\nYour reservation has been successfully completed.\n\nBooking Details:\nBooking ID: {{bookingId}}\nStart Date: {{startDate}}\nEnd Date: {{endDate}}\nPickup Location: {{pickupLocation}}\nTotal Price: {{totalPrice}}\n\nRental Company:\nCompany: {{tenantName}}\nPhone: {{phone}}\nEmail: {{email}}\n\nImportant Notes:\n- Please bring a valid driver's license\n- Arrive 15 minutes before your scheduled pickup time\n- Contact the rental company if you need to make any changes with your booking ID\n\n© 2025 Devvize Services. All rights reserved.\nNeed help? Contact our team at support@devvize.com",
    },
    {
        name: 'NewUser',
        subject: 'User Created',
        text: 'New System User Account Created!\n\nA system user account has been created for you in FleetNexa.\n\nAccount Details:\nCompany: {{tenantName}}\nName: {{name}}\nUsername: {{username}}\nPassword: {{password}}\n\nLogin URL: https://app.fleetnexa.com/login\n\nSecurity Notice:\n- You must change your password immediately after first login\n- This account provides access to sensitive system functions\n- Protect your credentials and never share them with others\n\nFor technical support or access issues, contact our IT team at it-support@devvize.com\n\n© 2025 Devvize Services. All rights reserved.',
    },
    {
        name: 'PasswordReset',
        subject: 'Your FleetNexa Password Has Been Reset',
        text: "Password Reset Notification\n\nYour FleetNexa password has been reset as requested.\n\nLogin Details:\nUsername: {{username}}\nTemporary Password: {{password}}\n\nLogin URL: https://app.fleetnexa.com/login\n\nImportant Security Notice:\n- You must change this temporary password immediately after logging in\n- This temporary password will expire in 24 hours\n\nIf you didn't request this password reset, please contact our security team immediately at security@devvize.com\n\n© 2025 Devvize Services. All rights reserved.",
    },
    {
        name: 'VerifyBusinessEmail',
        subject: 'Verify Your Business Email Address',
        text: 'Business Email Verification Required\n\nThank you for registering with FleetNexa!\n\nTo complete your business email verification, please use the verification code below:\n\nVerification Code: {{verificationCode}}\n\nThis code will expire in 30 minutes.\n\nAccount Details:\nCompany: {{tenantName}}\nEmail: {{email}}\nRequested: {{timestamp}}\n\nIf you did not request this verification, please ignore this email or contact our support team immediately.\n\nFor assistance, contact our support team at support@devvize.com\n\n© 2025 Devvize Services. All rights reserved.',
    },
    {
        name: 'BookingDocuments',
        subject: 'Your Booking Documents',
        text: "Your Booking Documents\n\nYour booking with {{tenantName}} is confirmed! Below are your booking details and important documents for your upcoming rental.\n\nBooking Summary:\nBooking ID: {{bookingId}}\nVehicle: {{vehicle}}\nRental Period: {{startDate}} to {{endDate}}\nPickup Location: {{pickupLocation}}\nPickup Time: {{pickupTime}}\nTotal Price: {{totalPrice}}\n\nRental Company Contact:\nCompany: {{tenantName}}\nPhone: {{phone}}\nEmail: {{email}}\n\nYour Documents:\nBooking Invoice: {{invoiceUrl}}\nRental Agreement: {{agreementUrl}}\n\nImportant Reminders:\n- Save these documents for your records. You may need to present them at pickup.\n- Please bring your driver's license and payment method used for booking when you pick up your vehicle.\n- Contact {{tenantName}} directly if you need to make any changes to your booking.\n\n© 2025 Devvize Services. All rights reserved.\nNeed assistance? Contact our support team at support@devvize.com",
    },
    {
        name: 'NewBooking',
        subject: 'New Booking Notification - Action Required',
        text: "New Booking Received!\n\nA customer has booked a vehicle through your storefront.\n\nBooking Overview:\nBooking ID: {{bookingId}}\nBooking Date: {{bookingDate}}\nVehicle: {{vehicle}}\nTotal Amount: {{totalPrice}}\nBooking Status: {{bookingStatus}} - ACTION REQUIRED\n\nCustomer Details:\nFull Name: {{customerName}}\nEmail: {{customerEmail}}\nPhone: {{customerPhone}}\nDriver's License: {{driverLicense}}\nCountry: {{customerCountry}}\n\nPickup Details:\nPickup Date: {{startDate}}\nPickup Time: {{pickupTime}}\nPickup Location: {{pickupLocation}}\nSpecial Instructions: {{pickupInstructions}}\n\nReturn Details:\nReturn Date: {{endDate}}\nReturn Time: {{returnTime}}\nReturn Location: {{returnLocation}}\nRental Duration: {{rentalDuration}}\n\nBooking Additions:\n{{#each bookingAdditions}}\n- {{this.name}}: {{this.quantity}} × {{this.price}} = {{this.total}}\n{{/each}}\n\nPayment Summary:\nVehicle Rental: {{vehiclePrice}}\nAdditional Services: {{additionsTotal}}\nTaxes & Fees: {{taxesFees}}\nTotal Amount: {{totalPrice}}\nPayment Status: {{paymentStatus}}\nPayment Method: {{paymentMethod}}\n\nNext Steps:\n- Contact customer to confirm pickup details\n- Prepare vehicle for rental\n- Review customer documents\n\nDashboard: {{dashboardLink}}\nContact Customer: {{contactCustomerLink}}\n\n© 2025 RentNexa - Caribbean Rental Storefront. All rights reserved.\nThis is an automated notification. Please do not reply to this email.",
    },
    {
        name: 'PasswordRequestStorefront',
        subject: 'Password Reset Verification - RentNexa',
        text: 'Password Reset Request\n\nUse the verification code below to reset your password:\n\nVerification Code: {{verificationCode}}\n\nThis code will expire in 10 minutes.\n\nIf you did not request a password reset, please ignore this email or contact our support team immediately.\n\n© 2025 RentNexa - Caribbean Rental Storefront. All rights reserved.\nThis is an automated notification. Please do not reply to this email.',
    },
];
