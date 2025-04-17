
import { User } from "./types";
import { supabase } from "@/integrations/supabase/client";

// Save user profile to localStorage for offline access
export const saveUserProfileToStorage = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem('userProfile', JSON.stringify(user));
      
      // Also ensure we have a flag indicating auth state
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      localStorage.removeItem('userProfile');
      localStorage.removeItem('isAuthenticated');
    }
  } catch (error) {
    console.error('Failed to save user profile to storage:', error);
  }
};

// Get user profile from localStorage
export const getUserProfileFromStorage = (): User | null => {
  try {
    const storedProfile = localStorage.getItem('userProfile');
    return storedProfile ? JSON.parse(storedProfile) : null;
  } catch (error) {
    console.error('Failed to get user profile from storage:', error);
    return null;
  }
};

// Check if there's a valid session in storage
export const hasValidSessionInStorage = async (): Promise<boolean> => {
  try {
    // Check if there's a session in Supabase client
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      return true;
    }
    
    // Check localStorage as fallback
    return localStorage.getItem('isAuthenticated') === 'true';
  } catch (error) {
    console.error('Error checking for valid session:', error);
    return false;
  }
};

// Force session cleanup
export const cleanupSession = async (): Promise<void> => {
  try {
    // Clear any stored session data
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('supabase.auth.token');
    
    // Force Supabase to clear its session
    await supabase.auth.signOut({ scope: 'local' });
  } catch (error) {
    console.error('Error cleaning up session:', error);
  }
};
