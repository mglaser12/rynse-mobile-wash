
import { supabase } from "@/integrations/supabase/client";
import { WashStatus } from "@/models/types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../supabaseApi";
import { handleSupabaseError, handleDirectApiResponse } from "./apiErrorHandling";

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
      return handleSupabaseError("standard insert", error);
    }

    return result;
  } catch (error) {
    return handleSupabaseError("standard insert exception", error);
  }
};

/**
 * Generate a UUID for the new request
 */
const generateRequestId = (): string => {
  return crypto.randomUUID();
};

/**
 * Prepare headers for direct API request
 */
const prepareApiHeaders = (accessToken: string | undefined) => {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${accessToken || ''}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
};

/**
 * Make the direct API request to insert wash request
 */
const makeDirectApiRequest = async (
  requestId: string, 
  insertData: WashRequestInsertData, 
  accessToken: string | undefined
) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/wash_requests`, {
    method: 'POST',
    headers: prepareApiHeaders(accessToken),
    body: JSON.stringify({
      id: requestId,
      ...insertData
    })
  });

  const result = await handleDirectApiResponse(response, "direct wash request insert");
  return result ? { id: requestId, ...result } : null;
};

/**
 * Insert a wash request using direct API call (fallback method)
 */
export const insertWashRequestDirect = async (
  insertData: WashRequestInsertData,
  accessToken: string | undefined
) => {
  try {
    const requestId = generateRequestId();
    return await makeDirectApiRequest(requestId, insertData, accessToken);
  } catch (error) {
    return handleSupabaseError("direct insert exception", error);
  }
};
