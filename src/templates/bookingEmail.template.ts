interface Document {
  documentUrl: string;
  documentType: string;
  filename?: string;
}

interface SendDocumentBody {
  documents: Document[];
  recipientEmail: string;
  senderName: string;
  senderEmail?: string;
  bookingId: string;
  message?: string;
}

export const bookingDocumentsEmail = ({
  message,
  vehicleDescription,
  booking,
  documents,
  user,
  tenant,
}: {
  message?: string;
  vehicleDescription: string;
  booking: any;
  documents: Document[];
  user: { firstName: string; lastName: string };
  tenant: {
    tenantName: string;
    email: string;
    number: string;
    logo: string;
  };
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
      * {
        box-sizing: border-box;
        font-family: Arial, sans-serif;
      }
      body {
        margin: 0;
        padding: 0;
        color: #333;
        line-height: 1.6;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .logo {
        max-height: 50px;
        max-width: 100%;
      }
      .section {
        margin: 20px 0;
      }
      .section-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #2c3e50;
      }
      .details-list {
        padding-left: 20px;
        margin: 0;
      }
      .details-list li {
        margin-bottom: 8px;
      }
      .divider {
        border: none;
        border-top: 1px solid #e0e0e0;
        margin: 30px 0;
      }
      .footer {
        font-size: 14px;
        color: #7f8c8d;
      }
      .signature {
        margin-top: 20px;
      }
      .powered-by {
        text-align: center;
        font-size: 13px;
        color: #95a5a6;
      }
      @media only screen and (max-width: 480px) {
        .container {
          padding: 15px;
        }
        .section-title {
          font-size: 16px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="${tenant.logo}" alt="${tenant.tenantName} Logo" class="logo">
      </div>
  
      <div class="section">
        <p>Good Day,</p>
        <p>${message || "Please find your booking documents attached for your recent vehicle reservation."}</p>
      </div>
  
      <div class="section">
        <div class="section-title">Booking Details</div>
        <ul class="details-list">
          <li><strong>Vehicle Description:</strong> ${vehicleDescription}</li>
          <li><strong>Pickup Date and Time:</strong> ${
            booking?.startDate
              ? `${new Date(booking.startDate).toLocaleDateString()} ${new Date(booking.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "N/A"
          }</li>
          <li><strong>Return Date and Time:</strong> ${
            booking?.endDate
              ? `${new Date(booking.endDate).toLocaleDateString()} ${new Date(booking.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "N/A"
          }</li>
          <li><strong>Pickup Location:</strong> ${booking?.pickup?.location || "N/A"}</li>
        </ul>
      </div>
  
      <div class="section">
        <div class="section-title">Attached Documents</div>
        <ul class="details-list">
          ${documents.map((doc) => `<li>${doc.documentType}</li>`).join("")}
        </ul>
      </div>
  
      <hr class="divider">
  
      <div class="footer">
        <div class="signature">
          <p>Best regards,</p>
          <p>
            ${user.firstName} ${user.lastName}<br>
            ${tenant.tenantName}<br>
            <a href="mailto:${tenant.email}" style="color: #3498db;">${tenant.email}</a><br>
            ${tenant.number}
          </p>
        </div>
  
        <div class="header" style="margin: 30px 0;">
          <img src="${tenant.logo}" alt="${tenant.tenantName} Logo" class="logo">
        </div>
  
        <hr class="divider">
  
        <div class="powered-by">
          Powered by <strong>FleetNexa™</strong> — Smarter Vehicle Rentals
        </div>
      </div>
    </div>
  </body>
  </html>
    `;
};
