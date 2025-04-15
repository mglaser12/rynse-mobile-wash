
import { WashRequest, WashStatus } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { patchWashRequest } from "./supabaseApi";

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
    const { customerId, vehicles, preferredDates, price, notes, organizationId } = washRequestData;
    
    // First get the first available location (or create one if needed)
    // This is a temporary solution until we implement proper location selection
    const { data: locationData, error: locationError } = await supabase
      .from('wash_locations')
      .select('id')
      .limit(1)
      .single();
      
    if (locationError) {
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
      
      // Use the newly created location
      var locationId = newLocation.id;
    } else {
      var locationId = locationData.id;
    }
    
    console.log("Using location ID:", locationId);
    
    // Get the user's organization_id from their profile
    let userOrgId = organizationId;
    if (!userOrgId) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (profileData?.organization_id) {
        userOrgId = profileData.organization_id;
      }
    }
    
    console.log("Using organization ID:", userOrgId);
    
    // Prepare data for insert
    const insertData = {
      user_id: user.id,
      location_id: locationId,
      preferred_date_start: preferredDates.start.toISOString(),
      preferred_date_end: preferredDates.end?.toISOString(),
      price,
      notes,
      status: 'pending',
      organization_id: userOrgId
    };

    // Try direct approach first with standard Supabase client
    try {
      const { data, error } = await supabase
        .from('wash_requests')
        .insert(insertData)
        .select('*')
        .single();
  
      if (error) {
        throw error;
      }
      
      // If we get here, the insert worked successfully
      console.log("Wash request created:", data);
      
      // Create vehicle associations
      const vehicleInserts = vehicles.map(vehicleId => ({
        wash_request_id: data.id,
        vehicle_id: vehicleId
      }));
  
      console.log("Creating vehicle associations:", vehicleInserts);
  
      const { error: vehicleError } = await supabase
        .from('wash_request_vehicles')
        .insert(vehicleInserts);
  
      if (vehicleError) {
        console.error("Error creating vehicle associations:", vehicleError);
        toast.error("Failed to link vehicles to wash request");
      }
  
      const newWashRequest: WashRequest = {
        id: data.id,
        customerId: data.user_id,
        vehicles: vehicles,
        preferredDates: {
          start: new Date(data.preferred_date_start),
          end: data.preferred_date_end ? new Date(data.preferred_date_end) : undefined
        },
        status: data.status as WashStatus,
        price: data.price,
        notes: data.notes || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        organizationId: data.organization_id
      };
      
      console.log("Returning new wash request object:", newWashRequest);
      toast.success("Wash request created successfully!");
      return newWashRequest;
    } 
    catch (supabaseError: any) {
      // If the error is related to the audit_log table not existing
      if (supabaseError.code === '42P01' && supabaseError.message.includes('audit_log')) {
        console.warn("Audit log error detected, falling back to direct API method");
        
        // Use the patchWashRequest function but with POST method instead
        // This is a workaround to bypass the database trigger
        const requestId = crypto.randomUUID(); // Generate a UUID for the new request
        
        // Create a direct API call to insert the wash request
        const SUPABASE_URL = "https://ebzruvonvlowdglrmduf.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVienJ1dm9udmxvd2RnbHJtZHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NzAzNTEsImV4cCI6MjA2MDI0NjM1MX0.1Hdcd2TyWfmGo6-1xIif2XoF8a14v7iHRRk7Tlw7DC0";
        
        // Get the access token
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        
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

        const data = await response.json();
        console.log("Wash request created via direct API:", data);

        // Now create the vehicle associations
        const vehicleInserts = vehicles.map(vehicleId => ({
          wash_request_id: requestId,
          vehicle_id: vehicleId
        }));

        const { error: vehicleError } = await supabase
          .from('wash_request_vehicles')
          .insert(vehicleInserts);

        if (vehicleError) {
          console.error("Error creating vehicle associations:", vehicleError);
          toast.error("Failed to link vehicles to wash request");
        }

        // Return the new wash request object
        const newWashRequest: WashRequest = {
          id: requestId,
          customerId: user.id,
          vehicles: vehicles,
          preferredDates: {
            start: preferredDates.start,
            end: preferredDates.end
          },
          status: 'pending',
          price: price,
          notes: notes,
          createdAt: new Date(),
          updatedAt: new Date(),
          organizationId: userOrgId
        };
        
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
