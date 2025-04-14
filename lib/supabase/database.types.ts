export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          login_attempts: number;
          email: string;
          two_factor_enabled: boolean;
          account_locked: boolean;
        };
        Insert: {
          id: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          login_attempts?: number;
          email: string;
          two_factor_enabled?: boolean;
          account_locked?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          login_attempts?: number;
          email?: string;
          two_factor_enabled?: boolean;
          account_locked?: boolean;
        };
      };
      murals: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          color: string;
          layout: string;
          is_public: boolean;
          allow_comments: boolean;
          allow_editing: boolean;
          created_at: string;
          updated_at: string;
          owner_id: string;
          views: number;
          last_viewed: string | null;
          tags: string[] | null;
          category: string | null;
          is_password_protected: boolean;
          password_hash: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          color?: string;
          layout?: string;
          is_public?: boolean;
          allow_comments?: boolean;
          allow_editing?: boolean;
          created_at?: string;
          updated_at?: string;
          owner_id: string;
          views?: number;
          last_viewed?: string | null;
          tags?: string[] | null;
          category?: string | null;
          is_password_protected?: boolean;
          password_hash?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          color?: string;
          layout?: string;
          is_public?: boolean;
          allow_comments?: boolean;
          allow_editing?: boolean;
          created_at?: string;
          updated_at?: string;
          owner_id?: string;
          views?: number;
          last_viewed?: string | null;
          tags?: string[] | null;
          category?: string | null;
          is_password_protected?: boolean;
          password_hash?: string | null;
        };
      };
      mural_items: {
        Row: {
          id: string;
          mural_id: string;
          type: string;
          content: string;
          title: string | null;
          description: string | null;
          caption: string | null;
          position_x: number;
          position_y: number;
          color: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          mural_id: string;
          type: string;
          content: string;
          title?: string | null;
          description?: string | null;
          caption?: string | null;
          position_x: number;
          position_y: number;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          mural_id?: string;
          type?: string;
          content?: string;
          title?: string | null;
          description?: string | null;
          caption?: string | null;
          position_x?: number;
          position_y?: number;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      permissions: {
        Row: {
          id: string;
          mural_id: string;
          user_id: string;
          role: string;
          added_at: string;
          added_by: string | null;
        };
        Insert: {
          id?: string;
          mural_id: string;
          user_id: string;
          role: string;
          added_at?: string;
          added_by?: string | null;
        };
        Update: {
          id?: string;
          mural_id?: string;
          user_id?: string;
          role?: string;
          added_at?: string;
          added_by?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          device_type: string;
          device_name: string;
          browser: string | null;
          os: string | null;
          ip: string | null;
          city: string | null;
          country: string | null;
          last_active: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_type: string;
          device_name: string;
          browser?: string | null;
          os?: string | null;
          ip?: string | null;
          city?: string | null;
          country?: string | null;
          last_active?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_type?: string;
          device_name?: string;
          browser?: string | null;
          os?: string | null;
          ip?: string | null;
          city?: string | null;
          country?: string | null;
          last_active?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          mural_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
          parent_id: string | null;
        };
        Insert: {
          id?: string;
          mural_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
        };
        Update: {
          id?: string;
          mural_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          mural_id: string | null;
          action_type: string;
          details: Json | null;
          ip: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          mural_id?: string | null;
          action_type: string;
          details?: Json | null;
          ip?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          mural_id?: string | null;
          action_type?: string;
          details?: Json | null;
          ip?: string | null;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          mural_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mural_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mural_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
