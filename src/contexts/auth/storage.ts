
import { User } from "./types";

// Save user profile to localStorage for offline access
export const saveUserProfileToStorage = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem('userProfile', JSON.stringify(user));
    } else {
      localStorage.removeItem('userProfile');
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
