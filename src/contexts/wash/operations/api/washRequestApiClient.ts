
import { supabase } from "@/integrations/supabase/client";
import { WashStatus } from "@/models/types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../supabaseApi";

interface WashRequestInsertData {
  user_id: string;
  location_id: string | null;
  location_detail_id: string | null;
  preferred_date_start: string;
  preferred_date_end?: string | null;
  price: number;
  notes?: string | null;
  status: WashStatus;
  organization_id?: string;
}

/**
 * Insert a wash request using standard Supabase client
 */
export const insertWashRequestStandard = async (
  data: WashRequestInsertData
) => {
  try {
    const { data: result, error } = await supabase
      .from('wash_requests')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      console.error("Error with standard insert:", error);
      return null;
    }

    return result;
  } catch (error) {
    console.error("Exception in standard insert:", error);
    return null;
  }
};

/**
 * Insert a wash request using direct API call (fallback method)
 */
export const insertWashRequestDirect = async (
  insertData: WashRequestInsertData,
  accessToken: string | undefined
) => {
  try {
    const requestId = crypto.randomUUID(); // Generate a UUID for the new request
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/wash_requests`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken || ''}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: requestId,
        ...insertData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Direct API insert failed:", errorText);
      return null;
    }

    const responseData = await response.json();
    return { id: requestId, ...responseData };
  } catch (error) {
    console.error("Exception in direct insert:", error);
    return null;
  }
};
