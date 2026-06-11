export const USER_ERRORS = {
  R2_NOT_CONFIGURED:
    "File upload is temporarily unavailable. Please try again later or contact support.",
  AZURE_NOT_CONFIGURED:
    "Document processing is temporarily unavailable. Please try again later.",
  OPENAI_NOT_CONFIGURED:
    "This document type is temporarily unavailable. Please try again later or contact support.",
  DATABASE_NOT_CONFIGURED:
    "The service is temporarily unavailable. Please try again later.",
  AUTH_NOT_CONFIGURED: "Sign-in is temporarily unavailable. Please try again later.",
  POLAR_NOT_CONFIGURED:
    "Online billing is not available yet. Contact support to upgrade your plan.",
  OCR_PROCESSING_FAILED:
    "We couldn't read this document. Try a clearer scan or a different file.",
  CHECKOUT_FAILED: "Checkout could not be started. Please try again or contact support.",
  BILLING_ADMIN_ONLY: "Only workspace admins can manage billing.",
  NO_BILLING_ACCOUNT: "No billing account yet. Subscribe to a paid plan first.",
} as const;

const TECHNICAL_PATTERNS = [
  /not configured/i,
  /\.env/i,
  /R2_/i,
  /AZURE_/i,
  /POLAR_/i,
  /OPENAI_/i,
  /SUPABASE/i,
  /ECONNREFUSED/i,
  /status code/i,
  /api[_-]?key/i,
];

export function sanitizeErrorMessage(message: string | null | undefined): string {
  if (!message?.trim()) return USER_ERRORS.OCR_PROCESSING_FAILED;
  if (TECHNICAL_PATTERNS.some((pattern) => pattern.test(message))) {
    return USER_ERRORS.OCR_PROCESSING_FAILED;
  }
  return message;
}
