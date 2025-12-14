// server/src/utils/sendEmail.ts

import nodemailer from "nodemailer";

interface ContactData {
  name: string;
  email: string;
  message: string;
}

// Log warning if Resend key is missing
if (!process.env.RESEND_API_KEY) {
  console.error("⚠️ RESEND_API_KEY is missing! Add it to your .env file.");
  console.error("   Get it from: https://resend.com/dashboard/api-keys");
}

// Create transporter using Resend (best for production)
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
});

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email connection failed:", error.message);
  } else {
    console.log("✅ Email ready – Resend connected successfully");
  }
});

// Main function – correctly exported as sendContactEmails (plural)
export const sendContactEmails = async (data: ContactData) => {
  const { name, email, message } = data;

  console.log(`📩 Sending contact emails for: ${name} <${email}>`);

  try {
    // 1. Email to Admin (you)
    await transporter.sendMail({
      from: '"PrepNaija Contact" <no-reply@prepnaija.com>',
      to: "support@prepnaija.com", // ← Change to your personal email if needed
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            ${message.replace(/\n/g, "<br>")}
          </div>
          <hr>
          <small>Sent from <strong>PrepNaija.com</strong> contact form</small>
        </div>
      `,
    });

    console.log("✅ Admin notification sent");

    // 2. Auto-reply to User
    await transporter.sendMail({
      from: '"PrepNaija Team" <support@prepnaija.com>',
      to: email,
      subject: "Thank you for contacting PrepNaija! 🙌",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h3>Hi ${name},</h3>
          <p>Thank you for reaching out to us!</p>
          <p>We’ve received your message and will get back to you <strong>within 2 hours</strong> during our support hours (Monday–Saturday, 8 AM – 8 PM WAT).</p>
          
          <p><strong>Your message:</strong></p>
          <div style="background: #f9f9f9; padding: 16px; border-left: 4px solid #7c3aed; border-radius: 8px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
          
          <br>
          <p>Best regards,<br>
          <strong>The PrepNaija Team</strong><br>
          <a href="mailto:support@prepnaija.com">support@prepnaija.com</a></p>
        </div>
      `,
    });

    console.log("✅ Auto-reply sent to user");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Email sending failed:", error.message || error);
    return { success: false, error: error.message || "Failed to send email" };
  }
};