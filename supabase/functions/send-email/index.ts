import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  recipientEmail: string;
  recipientName?: string;
  emailType: "company_approved" | "company_rejected";
  companyName: string;
  notificationToken: string;
  rejectionReason?: string;
}

interface BrevoEmailPayload {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  htmlContent: string;
  textContent: string;
}

function getCompanyApprovedEmailTemplate(
  companyName: string,
  notificationLink: string
): { subject: string; html: string; text: string } {
  const subject = `Great News! ${companyName} has been added to TruPlace`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 30px;">
                  <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: 700; color: #1f2937; line-height: 1.2;">
                    🎉 Great News!
                  </h1>
                  <p style="margin: 0 0 20px; font-size: 16px; color: #4b5563; line-height: 1.5;">
                    Your request to add <strong style="color: #1f2937;">${companyName}</strong> to TruPlace has been approved!
                  </p>
                  <p style="margin: 0 0 28px; font-size: 16px; color: #4b5563; line-height: 1.5;">
                    You can now share your experience and help others learn about working at ${companyName}.
                  </p>
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td align="center" style="padding: 0 0 28px;">
                        <a href="${notificationLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Write Your Review Now
                        </a>
                      </td>
                    </tr>
                  </table>
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 8px;">
                    <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280; line-height: 1.5;">
                      <strong>What happens next?</strong>
                    </p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #6b7280; line-height: 1.6;">
                      <li style="margin-bottom: 8px;">Click the button above to get started</li>
                      <li style="margin-bottom: 8px;">Share your honest experience about working at ${companyName}</li>
                      <li style="margin-bottom: 0;">Help others make informed career decisions</li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                    This link will expire in 7 days. If you have any questions, please contact us at support@truplace.com
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
Great News! ${companyName} has been added to TruPlace

Your request to add ${companyName} to TruPlace has been approved!

You can now share your experience and help others learn about working at ${companyName}.

Write Your Review Now: ${notificationLink}

What happens next?
- Click the link above to get started
- Share your honest experience about working at ${companyName}
- Help others make informed career decisions

This link will expire in 7 days. If you have any questions, please contact us at support@truplace.com
  `.trim();

  return { subject, html, text };
}

function getCompanyRejectedEmailTemplate(
  companyName: string,
  rejectionReason: string,
  requestNewCompanyLink: string
): { subject: string; html: string; text: string } {
  const subject = `Update on Your Company Request - ${companyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 30px;">
                  <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: 700; color: #1f2937; line-height: 1.2;">
                    Update on Your Company Request
                  </h1>
                  <p style="margin: 0 0 20px; font-size: 16px; color: #4b5563; line-height: 1.5;">
                    Thank you for your request to add <strong style="color: #1f2937;">${companyName}</strong> to TruPlace.
                  </p>
                  <p style="margin: 0 0 20px; font-size: 16px; color: #4b5563; line-height: 1.5;">
                    After careful review, we're unable to approve this request at this time.
                  </p>
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 0 0 24px; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
                      <strong>Reason:</strong> ${rejectionReason}
                    </p>
                  </div>
                  <p style="margin: 0 0 28px; font-size: 16px; color: #4b5563; line-height: 1.5;">
                    We appreciate your contribution to building our company database. You're welcome to submit a request for a different company.
                  </p>
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td align="center" style="padding: 0 0 28px;">
                        <a href="${requestNewCompanyLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Request Another Company
                        </a>
                      </td>
                    </tr>
                  </table>
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 8px;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                      If you believe this decision was made in error or have additional information to share, please contact us at <a href="mailto:support@truplace.com" style="color: #2563eb;">support@truplace.com</a>
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
Update on Your Company Request - ${companyName}

Thank you for your request to add ${companyName} to TruPlace.

After careful review, we're unable to approve this request at this time.

Reason: ${rejectionReason}

We appreciate your contribution to building our company database. You're welcome to submit a request for a different company.

Request Another Company: ${requestNewCompanyLink}

If you believe this decision was made in error or have additional information to share, please contact us at support@truplace.com
  `.trim();

  return { subject, html, text };
}

async function sendEmailViaBrevo(
  payload: BrevoEmailPayload,
  apiKey: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API error:", errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL");
    const senderName = Deno.env.get("BREVO_SENDER_NAME");
    const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";

    if (!brevoApiKey || !senderEmail || !senderName) {
      throw new Error("Missing required environment variables");
    }

    const emailRequest: EmailRequest = await req.json();

    const {
      recipientEmail,
      recipientName,
      emailType,
      companyName,
      notificationToken,
      rejectionReason,
    } = emailRequest;

    if (!recipientEmail || !emailType || !companyName || !notificationToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const notificationLink = `${appUrl}/notification/${notificationToken}`;
    const requestNewCompanyLink = `${appUrl}/request-company`;

    let emailTemplate: { subject: string; html: string; text: string };

    if (emailType === "company_approved") {
      emailTemplate = getCompanyApprovedEmailTemplate(
        companyName,
        notificationLink
      );
    } else if (emailType === "company_rejected") {
      if (!rejectionReason) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Rejection reason is required for rejected emails",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      emailTemplate = getCompanyRejectedEmailTemplate(
        companyName,
        rejectionReason,
        requestNewCompanyLink
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid email type",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const brevoPayload: BrevoEmailPayload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: recipientEmail,
          name: recipientName,
        },
      ],
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html,
      textContent: emailTemplate.text,
    };

    const result = await sendEmailViaBrevo(brevoPayload, brevoApiKey);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
