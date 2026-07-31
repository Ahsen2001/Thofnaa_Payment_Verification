import { PostgrestError } from "@supabase/supabase-js";

export interface StandardizedError {
  message: string;
  code?: string;
  originalError?: unknown;
}

/**
 * Parses Supabase / Postgrest errors into user-friendly diagnostic messages.
 */
export function handleSupabaseError(error: PostgrestError | Error | unknown): StandardizedError {
  if (!error) {
    return { message: "An unknown database error occurred." };
  }

  // Handle Postgrest Error codes
  if (typeof error === "object" && error !== null && "code" in error) {
    const pgError = error as PostgrestError;
    
    switch (pgError.code) {
      case "23505": // Unique constraint violation
        if (pgError.message.includes("idx_unique_verified_payment_per_period")) {
          return {
            code: pgError.code,
            message: "A verified payment record already exists for this student and monthly tuition period.",
            originalError: pgError,
          };
        }
        return {
          code: pgError.code,
          message: "Duplicate entry detected. This registration number or reference already exists.",
          originalError: pgError,
        };

      case "42501": // RLS Permission Denied
        return {
          code: pgError.code,
          message: "Access Denied: You do not have administrative permissions to perform this operation.",
          originalError: pgError,
        };

      case "PGRST116": // Row not found
        return {
          code: pgError.code,
          message: "The requested record was not found in THOFNAA database.",
          originalError: pgError,
        };

      default:
        return {
          code: pgError.code,
          message: pgError.message || "Database request failed.",
          originalError: pgError,
        };
    }
  }

  if (error instanceof Error) {
    return { message: error.message, originalError: error };
  }

  return { message: String(error) };
}
