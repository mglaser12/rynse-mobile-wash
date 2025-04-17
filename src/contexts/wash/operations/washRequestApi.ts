
import { supabase } from "@/integrations/supabase/client";
import { WashStatus } from "@/models/types";
import { toast } from "sonner";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseApi";

interface WashRequestInsertData {
  user_id: string;
  location_id: string;
  preferred_date_start: string;
  preferred_date_end?: string;
  price: number;
  notes?: string;
  status: WashStatus;
  organization_id?: string;
}

/**
 * Get a location ID for the wash request
 * @returns The ID of the first available location or a newly created default location
 */
export const getLocationId = async (): Promise<string | null> => {
  try {
    // Try to get the first available location
    const { data: locationData, error: locationError } = await supabase
      .from('wash_locations')
      .select('id')
      .limit(1)
      .single();
      
    if (!locationError) {
      return locationData.id;
    }
    
    console.log("No location found, creating default location");
    // If we can't find a location, create a default one
    const { data: newLocation, error: createLocationError } = await supabase
      .from('wash_locations')
      .insert({
        name: "Default Location",
        address: "123 Main St",
        city: "Default City",
        state: "CA",
        zip_code: "00000"
      })
      .select('id')
      .single();
      
    if (createLocationError) {
      console.error("Error creating default location:", createLocationError);
      toast.error("Failed to create wash request - location error");
      return null;
    }
    
    return newLocation.id;
  } catch (error) {
    console.error("Error getting location ID:", error);
    return null;
  }
};

/**
 * Get the organization ID for a user
 * @param userId The user ID
 * @param providedOrgId Optional organization ID that may already be provided
 * @returns The organization ID to use
 */
export const getUserOrganizationId = async (userId: string, providedOrgId?: string): Promise<string | undefined> => {
  // If an organization ID is already provided, use it
  if (providedOrgId) {
    return providedOrgId;
  }
  
  try {
    // Get the user's organization_id from their profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
      
    return profileData?.organization_id;
  } catch (error) {
    console.error("Error getting user organization ID:", error);
    return undefined;
  }
};

/**
 * Insert a wash request using standard Supabase client
 */
export const insertWashRequestStandard = async (
  data: WashRequestInsertData
) => {
  const { data: result, error } = await supabase
    .from('wash_requests')
    .insert(data)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return result;
};

/**
 * Create vehicle associations for a wash request
 */
export const createVehicleAssociations = async (washRequestId: string, vehicleIds: string[]) => {
  const vehicleInserts = vehicleIds.map(vehicleId => ({
    wash_request_id: washRequestId,
    vehicle_id: vehicleId
  }));

  const { error } = await supabase
    .from('wash_request_vehicles')
    .insert(vehicleInserts);

  if (error) {
    console.error("Error creating vehicle associations:", error);
    toast.error("Failed to link vehicles to wash request");
    return false;
  }
  return true;
};

/**
 * Insert a wash request using direct API call (fallback method)
 */
export const insertWashRequestDirect = async (
  insertData: WashRequestInsertData,
  accessToken: string | undefined
) => {
  const requestId = crypto.randomUUID(); // Generate a UUID for the new request
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/wash_requests`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id: requestId,
      ...insertData
    })
  });

  if (!response.ok) {
    console.error("Direct API insert failed:", await response.text());
    toast.error("Failed to create wash request");
    return null;
  }

  return { id: requestId, ...await response.json() };
};

/**
 * Retrieve a full wash request with all associated data
 * @param washRequestId The ID of the wash request to retrieve
 * @returns The wash request with vehicles and other related data
 */
export const getFullWashRequest = async (washRequestId: string) => {
  try {
    // Get the wash request
    const { data: washRequest, error: washError } = await supabase
      .from('wash_requests')
      .select(`
        *,
        location:locations(*)
      `)
      .eq('id', washRequestId)
      .single();

    if (washError) {
      console.error("Error retrieving wash request:", washError);
      return null;
    }

    // Get the vehicles associated with this wash request
    const { data: washVehicles, error: vehicleError } = await supabase
      .from('wash_request_vehicles')
      .select(`
        vehicle_id,
        vehicles:vehicle_id(*)
      `)
      .eq('wash_request_id', washRequestId);

    if (vehicleError) {
      console.error("Error retrieving wash request vehicles:", vehicleError);
      return null;
    }

    // Format the data to match our application models
    const formattedRequest = {
      id: washRequest.id,
      customerId: washRequest.user_id,
      vehicles: washVehicles.map(v => v.vehicle_id),
      vehicleDetails: washVehicles.map(v => v.vehicles),
      preferredDates: {
        start: new Date(washRequest.preferred_date_start),
        end: washRequest.preferred_date_end ? new Date(washRequest.preferred_date_end) : undefined
      },
      status: washRequest.status,
      technician: washRequest.technician_id,
      price: washRequest.price,
      notes: washRequest.notes,
      createdAt: new Date(washRequest.created_at),
      updatedAt: new Date(washRequest.updated_at),
      organizationId: washRequest.organization_id,
      locationId: washRequest.location_id,
      location: washRequest.location
    };

    return formattedRequest;
  } catch (error) {
    console.error("Error getting full wash request:", error);
    return null;
  }
};
