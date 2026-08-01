import { sendPaymentConfirmationEmail as sendConfirmationService, PaymentConfirmationPayload } from "@/lib/emailService";

export interface PaymentEmailPayload {
  toEmail: string;
  studentName: string;
  studentRegNo: string;
  paymentReference: string;
  paymentMonth: string;
  paymentYear: number;
  amountLKR: number;
  verifiedAt: string;
  programme?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * THOFNAA Transactional Email Bridge
 * Delegates directly to the reusable emailService.ts
 */
export async function sendPaymentConfirmationEmail(
  payload: PaymentEmailPayload
): Promise<SendEmailResult> {
  const result = await sendConfirmationService({
    toEmail: payload.toEmail,
    studentName: payload.studentName,
    studentRegNo: payload.studentRegNo,
    programme: payload.programme || "Second Language Sinhala",
    paymentMonth: `${payload.paymentMonth} ${payload.paymentYear}`,
    amountLKR: payload.amountLKR,
    paymentReference: payload.paymentReference,
  });

  return {
    success: result.success,
    messageId: result.messageId,
    error: result.error,
  };
}
