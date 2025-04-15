const twilio = require("twilio");

const accountSid = process.env.TWILLIO_ACCOUNT_SID || "";
const authToken = process.env.TWILLIO_AUTH_TOKEN || "";

const client = twilio(accountSid, authToken);

const sendWhatsAppNotification = async (req: any, res: any) => {
  const { to, body } = req.body;

  try {
    const message = await client.messages.create({
      body,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${to}`,
    });

    res.status(200).json({
      message: "WhatsApp message sent successfully",
      sid: message.sid,
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    res.status(500).json({ message: "Failed to send WhatsApp message", error });
  }
};

export default {
  sendWhatsAppNotification,
};
