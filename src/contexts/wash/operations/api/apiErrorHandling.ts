
/**
 * Standard error logging utility
 */
export const logApiError = (operation: string, error: any) => {
  console.error(`Error in ${operation}:`, error);
};

/**
 * Handle Supabase API errors with consistent logging
 */
export const handleSupabaseError = (operation: string, error: any): null => {
  logApiError(operation, error);
  return null;
};

/**
 * Process response from direct API calls
 */
export const handleDirectApiResponse = async (
  response: Response, 
  operation: string
) => {
  if (!response.ok) {
    const errorText = await response.text();
    logApiError(`${operation} - HTTP ${response.status}`, errorText);
    return null;
  }
  
  return await response.json();
};

// Add the handleApiError function to maintain backward compatibility
export const handleApiError = logApiError;
