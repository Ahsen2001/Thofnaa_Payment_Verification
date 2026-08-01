export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PaymentStatus = "pending" | "verified" | "rejected" | "needs_clarification";
export type StudentStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          registration_no: string;
          full_name: string;
          name_with_initials: string;
          grade: string;
          batch: string;
          programme: string;
          parent_name: string;
          parent_email: string;
          parent_whatsapp: string;
          monthly_fee: number;
          status: StudentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["students"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          payment_reference: string | null;
          student_id: string;
          payment_month: number;
          payment_year: number;
          amount: number;
          payment_date: string;
          payment_method: string;
          bank_reference: string | null;
          proof_path: string;
          status: PaymentStatus;
          admin_note: string | null;
          submitted_at: string;
          verified_at: string | null;
          verified_by: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "submitted_at" | "updated_at"> & {
          id?: string;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      admin_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          role: AdminRole;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["admin_profiles"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_profiles"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          admin_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_value: Json | null;
          new_value: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
    };
    Functions: {
      get_student_public_info: {
        Args: { p_registration_no: string };
        Returns: {
          id: string;
          registration_no: string;
          full_name: string;
          grade: string;
          batch: string;
          parent_email_masked: string;
        }[];
      };
      get_payment_public_status: {
        Args: { p_reference: string };
        Returns: {
          payment_reference: string;
          student_name: string;
          payment_month: number;
          payment_year: number;
          status: string;
          rejection_reason: string;
          submitted_at: string;
        }[];
      };
      verify_payment_and_assign_reference: {
        Args: {
          p_payment_id: string;
          p_admin_user_id: string;
          p_admin_note?: string | null;
        };
        Returns: {
          success: boolean;
          payment_reference: string;
          message: string;
        }[];
      };
    };
  };
}
