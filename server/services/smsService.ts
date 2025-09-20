import axios from 'axios';

const TERMII_API_KEY = process.env.TERMII_API_KEY || process.env.TERMII_KEY || "your-termii-api-key";
const TERMII_BASE_URL = "https://api.ng.termii.com/api";

export interface SendSmsRequest {
  to: string;
  message: string;
}

export interface SendSmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendStudyReminder(phone: string, name: string): Promise<SendSmsResponse> {
  const message = `Hi ${name}! 📚 Ready for your daily JAMB practice? Complete 10 questions today and earn energy points! - PrepNaija`;
  
  return await sendSMS({ to: phone, message });
}

export async function sendQuizResults(phone: string, name: string, score: number, subject: string): Promise<SendSmsResponse> {
  const message = `🎉 Great job ${name}! You scored ${score}% in ${subject}. Keep practicing to improve further! - PrepNaija`;
  
  return await sendSMS({ to: phone, message });
}

export async function sendSMS(request: SendSmsRequest): Promise<SendSmsResponse> {
  try {
    // Format Nigerian phone number
    let phoneNumber = request.to.replace(/\D/g, ''); // Remove non-digits
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '234' + phoneNumber.slice(1);
    } else if (!phoneNumber.startsWith('234')) {
      phoneNumber = '234' + phoneNumber;
    }

    const payload = {
      to: phoneNumber,
      from: "PrepNaija",
      sms: request.message,
      type: "plain",
      channel: "generic",
      api_key: TERMII_API_KEY,
    };

    const response = await axios.post(`${TERMII_BASE_URL}/sms/send`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
    });

    if (response.data && response.data.message_id) {
      return {
        success: true,
        messageId: response.data.message_id,
      };
    } else {
      return {
        success: false,
        error: response.data?.message || "Failed to send SMS",
      };
    }
  } catch (error: any) {
    console.error("Error sending SMS:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || "SMS service unavailable",
    };
  }
}

export async function validatePhoneNumber(phone: string): Promise<boolean> {
  // Basic Nigerian phone number validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Nigerian number format
  if (cleanPhone.startsWith('234')) {
    return cleanPhone.length === 13; // 234XXXXXXXXXX
  } else if (cleanPhone.startsWith('0')) {
    return cleanPhone.length === 11; // 0XXXXXXXXXX
  } else {
    return cleanPhone.length === 10; // XXXXXXXXXX
  }
}
