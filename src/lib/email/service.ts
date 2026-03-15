import "server-only";

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using a simple SMTP service or email API
 * For now, this uses a basic fetch to a hypothetical email service
 * In production, you'd integrate with services like:
 * - Resend
 * - SendGrid
 * - Postmark
 * - Amazon SES
 */
export async function sendEmail(emailData: EmailData): Promise<{ sent: boolean; error?: string }> {
  const emailService = process.env.EMAIL_SERVICE_URL;
  const emailApiKey = process.env.EMAIL_API_KEY;

  const finalEmailData = {
    from: "Neryn <notifications@neryn.pro>",
    ...emailData
  };

  // If no email service is configured, log and return success for development
  if (!emailService || !emailApiKey) {
    console.log("📧 [Dev Mode] Email would be sent:", finalEmailData.subject, "from", finalEmailData.from, "to", finalEmailData.to);
    return { sent: true };
  }

  try {
    const response = await fetch(emailService, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalEmailData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Email service error (${response.status}):`, errorText);
      throw new Error(`Email service returned ${response.status}`);
    }

    return { sent: true };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { sent: false, error: error.message };
  }
}

/**
 * Generate password reset email
 */
export function generatePasswordResetEmail(data: {
  userName: string;
  resetUrl: string;
  userEmail: string;
}): { subject: string; html: string; text: string } {
  const subject = `Reset your Neryn password`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 24px;">🔐 Reset Your Password</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">We received a request to reset your password</p>
        </div>

        <div style="margin-bottom: 30px;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Hi ${data.userName},</p>
            <p style="margin: 0 0 15px 0; color: #495057;">
                We received a request to reset the password for your Neryn account (${data.userEmail}).
            </p>
            <p style="margin: 0 0 20px 0; color: #495057;">
                Click the button below to reset your password. This link will expire in 1 hour for security reasons.
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}"
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Reset My Password
            </a>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #495057; font-size: 14px;">Security Tips:</p>
            <ul style="margin: 0; padding-left: 20px; color: #6c757d; font-size: 14px;">
                <li>If you didn't request this reset, you can safely ignore this email</li>
                <li>This link expires in 1 hour</li>
                <li>Never share reset links with others</li>
                <li>Choose a strong, unique password</li>
            </ul>
        </div>

        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
            <p>This is an automated email from Neryn.</p>
            <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; margin: 10px 0;">
                <a href="${data.resetUrl}" style="color: #667eea; text-decoration: none;">${data.resetUrl}</a>
            </p>
        </div>
    </body>
    </html>
  `;

  const text = `
Reset Your Neryn Password

Hi ${data.userName},

We received a request to reset the password for your Neryn account (${data.userEmail}).

Click this link to reset your password:
${data.resetUrl}

This link will expire in 1 hour for security reasons.

Security Tips:
- If you didn't request this reset, you can safely ignore this email
- Never share reset links with others
- Choose a strong, unique password

---
This is an automated email from Neryn.
If you're having trouble with the link, copy and paste it into your browser.
  `;

  return { subject, html, text };
}

/**
 * Generate handoff notification email
 */
export function generateHandoffEmail(data: {
  storeId: string;
  shopDomain: string;
  conversationId: string;
  visitorId: string;
  handoffReason: string;
  latestUserMessage: string;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `🔔 Human Assistance Requested - ${data.shopDomain}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Customer Needs Help</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">A customer has requested human assistance</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">Customer Details</h2>
            <p style="margin: 5px 0;"><strong>Store:</strong> ${data.shopDomain}</p>
            <p style="margin: 5px 0;"><strong>Visitor ID:</strong> ${data.visitorId}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${data.handoffReason}</p>
        </div>

        <div style="background: #fff; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #495057; font-size: 16px;">Latest Message:</h3>
            <p style="margin: 0; padding: 10px; background: #f1f3f4; border-radius: 4px; font-style: italic;">"${data.latestUserMessage}"</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}"
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Conversation
            </a>
        </div>

        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
            <p>This is an automated notification from your AI Sales Agent.</p>
            <p>Please respond to the customer promptly through your dashboard.</p>
        </div>
    </body>
    </html>
  `;

  const text = `
🔔 Customer Needs Help

A customer has requested human assistance:

Store: ${data.shopDomain}
Visitor ID: ${data.visitorId}
Reason: ${data.handoffReason}

Latest Message: "${data.latestUserMessage}"

View the conversation: ${data.dashboardUrl}

---
This is an automated notification from your AI Sales Agent.
Please respond to the customer promptly through your dashboard.
  `;

  return { subject, html, text };
}