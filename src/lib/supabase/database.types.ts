/**
 * Kiểu dữ liệu Postgres của Supabase.
 *
 * Sinh lại sau khi đổi schema:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 *
 * Bản dưới đây được viết tay theo đúng migration trong supabase/migrations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          card_code: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          tier: "Thường" | "Vàng" | "Đọc tại chỗ";
          max_books: number;
          joined_on: string;
          expires_on: string;
          status: "active" | "suspended";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          card_code: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          tier?: "Thường" | "Vàng" | "Đọc tại chỗ";
          max_books?: number;
          joined_on?: string;
          expires_on: string;
          status?: "active" | "suspended";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          card_code?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          tier?: "Thường" | "Vàng" | "Đọc tại chỗ";
          max_books?: number;
          joined_on?: string;
          expires_on?: string;
          status?: "active" | "suspended";
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      books: {
        Row: {
          id: string;
          code: string;
          title: string;
          author: string;
          subject: string;
          publisher: string | null;
          publish_year: number | null;
          page_count: number | null;
          shelf: string | null;
          keywords: string | null;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          author: string;
          subject: string;
          publisher?: string | null;
          publish_year?: number | null;
          page_count?: number | null;
          shelf?: string | null;
          keywords?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          title?: string;
          author?: string;
          subject?: string;
          publisher?: string | null;
          publish_year?: number | null;
          page_count?: number | null;
          shelf?: string | null;
          keywords?: string | null;
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      book_copies: {
        Row: {
          id: string;
          book_id: string;
          copy_label: string;
          acquired_on: string | null;
          condition: "Tốt" | "Khá" | "Hư cần sửa" | "Hư";
        };
        Insert: {
          id?: string;
          book_id: string;
          copy_label: string;
          acquired_on?: string | null;
          condition?: "Tốt" | "Khá" | "Hư cần sửa" | "Hư";
        };
        Update: {
          copy_label?: string;
          acquired_on?: string | null;
          condition?: "Tốt" | "Khá" | "Hư cần sửa" | "Hư";
        };
        Relationships: [
          {
            foreignKeyName: "book_copies_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };

      loans: {
        Row: {
          id: string;
          receipt_code: string;
          book_id: string;
          copy_id: string | null;
          member_id: string;
          borrowed_on: string;
          due_on: string;
          returned_on: string | null;
          fine_amount: number;
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          receipt_code: string;
          book_id: string;
          copy_id?: string | null;
          member_id: string;
          borrowed_on?: string;
          due_on: string;
          returned_on?: string | null;
          fine_amount?: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          receipt_code?: string;
          book_id?: string;
          copy_id?: string | null;
          member_id?: string;
          borrowed_on?: string;
          due_on?: string;
          returned_on?: string | null;
          fine_amount?: number;
          note?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loans_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_copy_id_fkey";
            columns: ["copy_id"];
            isOneToOne: false;
            referencedRelation: "book_copies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };

      reservations: {
        Row: {
          id: string;
          book_id: string;
          member_id: string;
          reserved_on: string;
          status: "waiting" | "ready" | "picked_up" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          member_id: string;
          reserved_on?: string;
          status?: "waiting" | "ready" | "picked_up" | "cancelled";
          created_at?: string;
        };
        Update: {
          reserved_on?: string;
          status?: "waiting" | "ready" | "picked_up" | "cancelled";
        };
        Relationships: [];
      };

      fines: {
        Row: {
          id: string;
          loan_id: string | null;
          member_id: string;
          days_late: number;
          amount: number;
          paid: boolean;
          paid_on: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          loan_id?: string | null;
          member_id: string;
          days_late?: number;
          amount?: number;
          paid?: boolean;
          paid_on?: string | null;
          created_at?: string;
        };
        Update: {
          days_late?: number;
          amount?: number;
          paid?: boolean;
          paid_on?: string | null;
        };
        Relationships: [];
      };

      audit_log: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          detail: Json | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          detail?: Json | null;
          created_at?: string;
        };
        Update: {
          action?: string;
          entity?: string;
          entity_id?: string | null;
          detail?: Json | null;
        };
        Relationships: [];
      };

      library_settings: {
        Row: {
          id: boolean;
          name: string;
          loan_days: number;
          fine_per_day: number;
          max_renewals: number;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          name?: string;
          loan_days?: number;
          fine_per_day?: number;
          max_renewals?: number;
          updated_at?: string;
        };
        Update: {
          name?: string;
          loan_days?: number;
          fine_per_day?: number;
          max_renewals?: number;
          updated_at?: string;
        };
        Relationships: [];
      };

      book_stock: {
        Row: {
          id: string;
          code: string;
          title: string;
          author: string;
          subject: string;
          publisher: string | null;
          publish_year: number | null;
          page_count: number | null;
          shelf: string | null;
          keywords: string | null;
          summary: string | null;
          total_copies: number;
          available_copies: number;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: {
      is_librarian: { Args: Record<PropertyKey, never>; Returns: boolean };
      days_late: { Args: { due_on: string }; Returns: number };
      library_today: { Args: Record<PropertyKey, never>; Returns: string };
    };
    Enums: {
      member_tier: "Thường" | "Vàng" | "Đọc tại chỗ";
      member_status: "active" | "suspended";
      copy_condition: "Tốt" | "Khá" | "Hư cần sửa" | "Hư";
      reservation_status: "waiting" | "ready" | "picked_up" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
