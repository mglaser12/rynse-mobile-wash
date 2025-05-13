import { supabase } from "@/integrations/supabase/client";
import { logApiError, handleSupabaseError } from "./apiErrorHandling";

// Standard insert using Supabase client
export const insertWashRequestStandard = async (washRequestData: any) => {
  try {
    const { data, error } = await supabase
      .from('wash_requests')
      .insert(washRequestData)
      .select('*')
      .single();
    
    if (error) {
      console.error("Standard insert error:", error);
      return null;
    }
    
    return data;
  } catch (err) {
    logApiError("insertWashRequestStandard", err);
    return null;
  }
};

// Direct insert using REST API
export const insertWashRequestDirect = async (washRequestData: any, accessToken: string | undefined) => {
  if (!accessToken) {
    console.error("No access token available for direct API call");
    return null;
  }
  
  try {
    // Use environment variables or public constants instead of accessing protected properties
    const supabaseUrl = process.env.SUPABASE_URL || "https://ebzruvonvlowdglrmduf.supabase.co";
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVienJ1dm9udmxvd2RnbHJtZHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NzAzNTEsImV4cCI6MjA2MDI0NjM1MX0.1Hdcd2TyWfmGo6-1xIif2XoF8a14v7iHRRk7Tlw7DC0";
    
    const endpoint = `${supabaseUrl}/rest/v1/wash_requests`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(washRequestData)
    });
    
    if (!response.ok) {
      console.error("Direct API error:", await response.text());
      return null;
    }
    
    const result = await response.json();
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (err) {
    logApiError("insertWashRequestDirect", err);
    return null;
  }
};

// Process inserted wash request data from API
export const processInsertedWashRequest = async (result: any) => {
  if (!result) return null;
  
  // Extract the relevant data
  const { id, user_id, preferred_date_start, preferred_date_end, status, price, notes } = result;
  
  // Return the processed data
  return {
    id,
    customerId: user_id,
    preferredDates: {
      start: new Date(preferred_date_start),
      end: preferred_date_end ? new Date(preferred_date_end) : undefined
    },
    status,
    price,
    notes,
    vehicleServices: result.metadata?.vehicleServices || []
  };
};
