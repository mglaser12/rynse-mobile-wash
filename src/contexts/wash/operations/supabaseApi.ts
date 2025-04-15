
import { toast } from "sonner";

// Define constants for Supabase API URL and key
export const SUPABASE_URL = "https://ebzruvonvlowdglrmduf.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVienJ1dm9udmxvd2RnbHJtZHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NzAzNTEsImV4cCI6MjA2MDI0NjM1MX0.1Hdcd2TyWfmGo6-1xIif2XoF8a14v7iHRRk7Tlw7DC0";

/**
 * Makes a direct PATCH request to the Supabase REST API
 */
export async function patchWashRequest(requestId: string, updateData: any): Promise<boolean> {
  console.log(`SENDING PATCH TO SUPABASE: ${requestId}`, {
    method: 'PATCH',
    endpoint: `/rest/v1/wash_requests?id=eq.${requestId}`,
    headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify(updateData)
  });
  
  try {
    console.log("Trying direct PATCH request first...");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/wash_requests?id=eq.${requestId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log("DIRECT API RESPONSE:", {
      status: response.status,
      statusText: response.statusText,
    });
    
    return response.ok;
    
  } catch (error) {
    console.error("Error in patchWashRequest:", error);
    return false;
  }
}
