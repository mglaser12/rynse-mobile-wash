
import { User as SupabaseUser } from "@supabase/supabase-js";

export type User = {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  organizationId?: string;
  avatarUrl?: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  authError: string | null; // Add authError property
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>; // Added refresh session method
};
