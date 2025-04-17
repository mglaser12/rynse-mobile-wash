
/**
 * Maps Supabase auth error messages to more user-friendly messages
 */
export const mapAuthErrorMessage = (error: string): string => {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "The email or password you entered is incorrect.",
    "Email not confirmed": "Please verify your email address before logging in.",
    "User already registered": "An account with this email already exists.",
    "Password should be at least 6 characters": "Please use a password with at least 6 characters.",
    "Rate limit exceeded": "Too many login attempts. Please try again later.",
  };

  // Return mapped message or original if no mapping exists
  return errorMap[error] || error;
};

/**
 * Formats error messages for display
 */
export const formatAuthError = (error: any): string => {
  if (!error) return "An unknown error occurred";
  
  // Handle different error types
  if (typeof error === 'string') {
    return mapAuthErrorMessage(error);
  }
  
  if (error instanceof Error) {
    return mapAuthErrorMessage(error.message);
  }
  
  if (typeof error === 'object' && error !== null) {
    const message = error.message || error.error_description || JSON.stringify(error);
    return mapAuthErrorMessage(message);
  }
  
  return "An unexpected error occurred";
};

/**
 * Log auth errors consistently
 */
export const logAuthError = (operation: string, error: any): void => {
  console.group(`🔐 Auth Error: ${operation}`);
  console.error("Error details:", error);
  console.error("Timestamp:", new Date().toISOString());
  console.groupEnd();
};
