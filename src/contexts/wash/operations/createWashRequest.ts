
import { WashRequest } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  getLocationId,
  getUserOrganizationId,
  insertWashRequestStandard,
  createVehicleAssociations,
  insertWashRequestDirect
} from "./washRequestApi";
import { mapToWashRequest, prepareWashRequestData } from "./washRequestMappers";

export async function createWashRequest(
  user: { id: string } | null,
  washRequestData: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">
): Promise<WashRequest | null> {
  if (!user) {
    console.log("No user provided to createWashRequest");
    toast.error("You must be logged in to create a wash request");
    return null;
  }

  console.log("Creating wash request for user:", user.id);
  console.log("Wash request data:", washRequestData);

  try {
    const { vehicles, preferredDates, price, notes, organizationId } = washRequestData;
    
    // Get location ID
    const locationId = await getLocationId();
    if (!locationId) return null;
    
    console.log("Using location ID:", locationId);
    
    // Get organization ID
    const userOrgId = await getUserOrganizationId(user.id, organizationId);
    console.log("Using organization ID:", userOrgId);
    
    // Prepare data for insert
    const insertData = prepareWashRequestData(
      user.id,
      locationId,
      preferredDates.start,
      preferredDates.end,
      price,
      notes,
      userOrgId
    );

    // Try standard approach first
    try {
      const data = await insertWashRequestStandard(insertData);
      
      // If we get here, the insert worked successfully
      console.log("Wash request created:", data);
      
      // Create vehicle associations
      await createVehicleAssociations(data.id, vehicles);
  
      // Map to wash request model
      const newWashRequest = mapToWashRequest(data, user.id, vehicles, userOrgId);
      
      console.log("Returning new wash request object:", newWashRequest);
      toast.success("Wash request created successfully!");
      return newWashRequest;
    } 
    catch (supabaseError: any) {
      // If the error is related to the audit_log table not existing
      if (supabaseError.code === '42P01' && supabaseError.message.includes('audit_log')) {
        console.warn("Audit log error detected, falling back to direct API method");
        
        // Get the access token for API call
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        
        // Use direct API call as fallback
        const data = await insertWashRequestDirect(insertData, accessToken);
        if (!data) return null;

        // Create vehicle associations
        await createVehicleAssociations(data.id, vehicles);

        // Map to wash request model
        const newWashRequest = mapToWashRequest(data, user.id, vehicles, userOrgId);
        
        toast.success("Wash request created successfully!");
        return newWashRequest;
      } else {
        // For other errors, just throw them to be handled by the outer catch
        throw supabaseError;
      }
    }
  } catch (error) {
    console.error("Error creating wash request:", error);
    toast.error("Failed to create wash request");
    return null;
  }
}
