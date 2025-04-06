import { Request, Response } from "express";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendContactEmail = async (req: Request, res: Response) => {
  const { name, email, companyName, formType } = req.body;

  if (!name || !email || !companyName || !formType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await resend.emails.send({
      from: "FleetNexa <noreply@devvize.com>",
      to: "contact@devvize.com",
      subject: `New Form Submission - ${formType}`,

      // HTML Version with Styling
      html: `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          h3 {
            font-size: 24px;
            color: #007BFF;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
          }
          strong {
            color: #007BFF;
          }
          .footer {
            font-size: 14px;
            color: #888;
            margin-top: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h3>New Form Submission - ${formType}</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company Name:</strong> ${companyName}</p>
          <div class="footer">
            <p>FleetNexa Team</p>
          </div>
        </div>
      </body>
    </html>
  `,

      text: `
    New Form Submission - ${formType}

    Name: ${name}
    Email: ${email}
    Company Name: ${companyName}

    -- 
    FleetNexa Team
  `,
    });

    return res
      .status(200)
      .json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send email" });
  }
};

export default {
  sendContactEmail,
};
