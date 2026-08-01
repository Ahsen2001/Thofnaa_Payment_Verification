import { Resend } from "resend";
import { env } from "@/lib/env";

export interface PaymentConfirmationPayload {
  toEmail: string;
  studentName: string;
  studentRegNo: string;
  programme: string;
  paymentMonth: string;
  amountLKR: number;
  paymentReference: string;
}

export interface ClarificationEmailPayload {
  toEmail: string;
  studentName: string;
  studentRegNo: string;
  paymentMonth: string;
  amountLKR: number;
  adminNote: string;
}

export interface RejectionEmailPayload {
  toEmail: string;
  studentName: string;
  studentRegNo: string;
  paymentMonth: string;
  amountLKR: number;
  adminNote: string;
}

export interface EmailServiceResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Common HTML Wrapper Generator for THOFNAA Transactional Emails
 */
function renderBaseHtml(title: string, bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #F8F7F2;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #263238;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #FFFFFF;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(18, 53, 91, 0.1);
            border: 2px solid #E7B33E;
          }
          .header {
            background-color: #12355B;
            padding: 32px 24px;
            text-align: center;
            border-bottom: 4px solid #E7B33E;
          }
          .brand-title {
            color: #FFFFFF;
            font-family: Georgia, serif;
            font-size: 26px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 1px;
          }
          .brand-tagline {
            color: #E7B33E;
            font-size: 12px;
            font-family: monospace;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 6px;
          }
          .content {
            padding: 32px 28px;
          }
          .salutation {
            font-size: 16px;
            font-weight: 600;
            color: #12355B;
            margin-bottom: 12px;
          }
          .intro-text {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 24px;
          }
          .note-box {
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 24px;
            font-size: 14px;
            line-height: 1.6;
          }
          .note-box-amber {
            background-color: #FFFBEB;
            border: 1px solid #FCD34D;
            color: #92400E;
          }
          .note-box-red {
            background-color: #FEF2F2;
            border: 1px solid #FCA5A5;
            color: #991B1B;
          }
          .note-title {
            font-weight: bold;
            font-size: 12px;
            font-family: monospace;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
          }
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 14px;
          }
          .receipt-table tr {
            border-bottom: 1px solid #E2E8F0;
          }
          .receipt-table td {
            padding: 12px 8px;
          }
          .label-col {
            color: #64748B;
            font-size: 13px;
            width: 40%;
          }
          .val-col {
            color: #12355B;
            font-weight: 600;
            text-align: right;
          }
          .button-action {
            display: inline-block;
            background-color: #12355B;
            color: #FFFFFF !important;
            font-weight: bold;
            font-size: 14px;
            padding: 14px 28px;
            border-radius: 12px;
            text-decoration: none;
            text-align: center;
            margin: 16px 0;
            box-shadow: 0 4px 12px rgba(18, 53, 91, 0.2);
          }
          .footer {
            background-color: #12355B;
            color: #F8F7F2;
            padding: 24px;
            text-align: center;
            font-size: 12px;
          }
          .footer-brand {
            color: #E7B33E;
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 8px;
          }
          .contact-line {
            color: #CBD5E1;
            margin: 4px 0;
            font-size: 12px;
          }
          .contact-link {
            color: #E7B33E;
            text-decoration: none;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand-title">THOFNAA INSTITUTE</h1>
            <div class="brand-tagline">Learn • Achieve • Succeed</div>
          </div>
          <div class="content">
            ${bodyContent}
          </div>
          <div class="footer">
            <div class="footer-brand">THOFNAA INSTITUTE</div>
            <div class="contact-line">Learn • Achieve • Succeed</div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
              <div class="contact-line">
                WhatsApp: <a href="https://wa.me/94754603008" class="contact-link">+94 75 460 3008</a>
              </div>
              <div class="contact-line">
                Email: <a href="mailto:${env.resend.adminEmail}" class="contact-link">${env.resend.adminEmail}</a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * 1. PAYMENT CONFIRMED EMAIL SERVICE
 */
export async function sendPaymentConfirmationEmail(
  payload: PaymentConfirmationPayload
): Promise<EmailServiceResult> {
  const { toEmail, studentName, studentRegNo, programme, paymentMonth, amountLKR, paymentReference } = payload;
  const apiKey = env.resend.apiKey;
  const fromEmail = env.resend.fromEmail;

  const bodyContent = `
    <div class="salutation">Dear Parent/Guardian,</div>
    <p class="intro-text">
      We are pleased to confirm that your payment has been successfully verified by <strong>THOFNAA INSTITUTE</strong>.
    </p>

    <div style="background-color: #F8F7F2; border: 2px dashed #E7B33E; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #64748B; letter-spacing: 1px;">Official Payment Reference</div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: bold; color: #12355B; margin-top: 4px;">${paymentReference}</div>
    </div>

    <table class="receipt-table">
      <tr>
        <td class="label-col">Student:</td>
        <td class="val-col">${studentName}</td>
      </tr>
      <tr>
        <td class="label-col">Registration No:</td>
        <td class="val-col" style="font-family: monospace;">${studentRegNo}</td>
      </tr>
      <tr>
        <td class="label-col">Programme:</td>
        <td class="val-col">${programme}</td>
      </tr>
      <tr>
        <td class="label-col">Payment Month:</td>
        <td class="val-col">${paymentMonth}</td>
      </tr>
      <tr>
        <td class="label-col">Amount:</td>
        <td class="val-col" style="color: #159A6A; font-size: 16px; font-weight: bold;">LKR ${amountLKR.toLocaleString()}.00</td>
      </tr>
      <tr>
        <td class="label-col">Status:</td>
        <td class="val-col">
          <span style="display: inline-block; background-color: #D1FAE5; color: #159A6A; font-weight: bold; font-size: 12px; padding: 4px 12px; border-radius: 999px; border: 1px solid #A7F3D0;">PAID</span>
        </td>
      </tr>
    </table>

    <div style="font-size: 14px; line-height: 1.6; color: #475569; margin-top: 24px;">
      Thank you for your payment.
    </div>
  `;

  const html = renderBaseHtml("Payment Confirmed – THOFNAA INSTITUTE", bodyContent);

  if (!apiKey || apiKey.includes("re_demo_key")) {
    console.log(`[THOFNAA RESEND SIMULATION - PAYMENT CONFIRMED] To: ${toEmail} | Ref: ${paymentReference}`);
    return { success: true, messageId: `demo-resend-${Date.now()}` };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: "Payment Confirmed – THOFNAA INSTITUTE",
      html,
    });

    if (result.error) {
      console.error("[THOFNAA Resend Email Error]:", result.error);
      return { success: false, error: result.error.message };
    }
    return { success: true, messageId: result.data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Email error" };
  }
}

/**
 * 2. PAYMENT NEEDS CLARIFICATION EMAIL SERVICE
 */
export async function sendNeedsClarificationEmail(
  payload: ClarificationEmailPayload
): Promise<EmailServiceResult> {
  const { toEmail, studentName, studentRegNo, paymentMonth, amountLKR, adminNote } = payload;
  const apiKey = env.resend.apiKey;
  const fromEmail = env.resend.fromEmail;

  const bodyContent = `
    <div class="salutation">Dear Parent/Guardian,</div>
    <p class="intro-text">
      Thank you for submitting your payment proof for <strong>THOFNAA INSTITUTE</strong> tuition. During our routine administrative verification, our team noticed that additional clarification is needed regarding your submitted deposit receipt.
    </p>

    <table class="receipt-table">
      <tr>
        <td class="label-col">Student:</td>
        <td class="val-col">${studentName}</td>
      </tr>
      <tr>
        <td class="label-col">Registration No:</td>
        <td class="val-col" style="font-family: monospace;">${studentRegNo}</td>
      </tr>
      <tr>
        <td class="label-col">Tuition Period:</td>
        <td class="val-col">${paymentMonth}</td>
      </tr>
      <tr>
        <td class="label-col">Submitted Amount:</td>
        <td class="val-col" style="font-weight: bold;">LKR ${amountLKR.toLocaleString()}.00</td>
      </tr>
    </table>

    <div class="note-box note-box-amber">
      <div class="note-title">⚠️ Administrator Note:</div>
      <div>${adminNote}</div>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      <strong>Action Required:</strong> Please visit the THOFNAA Student Payment Portal to re-submit a clear, un-cropped image or PDF document of your official deposit receipt so we can finalize your verification.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${env.siteUrl}/payment" class="button-action">Re-submit Payment Proof →</a>
    </div>

    <div style="font-size: 13px; color: #64748B; margin-top: 16px;">
      Thank you for your prompt assistance.
    </div>
  `;

  const html = renderBaseHtml("Action Required – THOFNAA Payment Verification", bodyContent);

  if (!apiKey || apiKey.includes("re_demo_key")) {
    console.log(`[THOFNAA RESEND SIMULATION - NEEDS CLARIFICATION] To: ${toEmail} | Student: ${studentRegNo}`);
    return { success: true, messageId: `demo-resend-${Date.now()}` };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: "Action Required – THOFNAA Payment Verification",
      html,
    });

    if (result.error) {
      console.error("[THOFNAA Resend Email Error]:", result.error);
      return { success: false, error: result.error.message };
    }
    return { success: true, messageId: result.data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Email error" };
  }
}

/**
 * 3. PAYMENT REJECTED EMAIL SERVICE
 */
export async function sendPaymentRejectedEmail(
  payload: RejectionEmailPayload
): Promise<EmailServiceResult> {
  const { toEmail, studentName, studentRegNo, paymentMonth, amountLKR, adminNote } = payload;
  const apiKey = env.resend.apiKey;
  const fromEmail = env.resend.fromEmail;

  const bodyContent = `
    <div class="salutation">Dear Parent/Guardian,</div>
    <p class="intro-text">
      We are writing to update you regarding your recent payment proof submission for <strong>THOFNAA INSTITUTE</strong> tuition.
    </p>

    <table class="receipt-table">
      <tr>
        <td class="label-col">Student:</td>
        <td class="val-col">${studentName}</td>
      </tr>
      <tr>
        <td class="label-col">Registration No:</td>
        <td class="val-col" style="font-family: monospace;">${studentRegNo}</td>
      </tr>
      <tr>
        <td class="label-col">Tuition Period:</td>
        <td class="val-col">${paymentMonth}</td>
      </tr>
      <tr>
        <td class="label-col">Submitted Amount:</td>
        <td class="val-col">LKR ${amountLKR.toLocaleString()}.00</td>
      </tr>
    </table>

    <div class="note-box note-box-red">
      <div class="note-title">Reason for Verification Update:</div>
      <div>${adminNote}</div>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      If you believe this update was made in error or if you have already completed a bank deposit, please feel free to reach out to our administration team via WhatsApp or email below so we can assist you right away.
    </p>

    <div style="font-size: 13px; color: #64748B; margin-top: 24px;">
      Thank you for your understanding and cooperation.
    </div>
  `;

  const html = renderBaseHtml("Payment Verification Update – THOFNAA INSTITUTE", bodyContent);

  if (!apiKey || apiKey.includes("re_demo_key")) {
    console.log(`[THOFNAA RESEND SIMULATION - PAYMENT REJECTED] To: ${toEmail} | Student: ${studentRegNo}`);
    return { success: true, messageId: `demo-resend-${Date.now()}` };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: "Payment Verification Update – THOFNAA INSTITUTE",
      html,
    });

    if (result.error) {
      console.error("[THOFNAA Resend Email Error]:", result.error);
      return { success: false, error: result.error.message };
    }
    return { success: true, messageId: result.data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Email error" };
  }
}
