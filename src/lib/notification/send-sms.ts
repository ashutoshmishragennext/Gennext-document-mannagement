import twilio from "twilio";

interface SendSmsParams {
  phone: string;
  message: string
}

interface SendSmsResult {
  success: boolean;
  data?: {
    messageSid: string;
  };
  error?: string;
}

/**
 * Sends an SMS message using Twilio
 *
 * @param params Object containing phone number and message text
 * @returns Promise with result object containing success status and either data or error
 */
export async function sendSms(params: SendSmsParams): Promise<SendSmsResult> {
  // Validate environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_NUMBER;

  if (!accountSid || !token || !twilioNumber) {
    console.error("Missing Twilio credentials in environment variables");
    return {
      success: false,
      error: "Missing Twilio configuration. Check environment variables.",
    };
  }

  // Validate input parameters
  const { phone, message } = params;

  if (!phone) {
    return {
      success: false,
      error: "Phone number is required",
    };
  }

  if (!message) {
    return {
      success: false,
      error: "Message is required",
    };
  }



  try {
    // Initialize Twilio client
    const client = twilio(accountSid, token);

    // Send message
    const twilioMessage = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: phone,
    });

    // Return success result
    return {
      success: true,
      data: {
        messageSid: twilioMessage.sid,
      },
    };
  } catch (error) {
    // Log error for debugging
    console.error("Twilio API error:", error);

    // Return error result
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
