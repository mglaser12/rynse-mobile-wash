
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, WashStatus } from "@/models/types";

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
        location:location_id(*)
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

    // Map the raw vehicle data from Supabase to our Vehicle type
    const vehicleDetails: Vehicle[] = washVehicles.map(v => {
      const vehicleData = v.vehicles;
      return {
        id: vehicleData.id,
        customerId: vehicleData.user_id,
        type: vehicleData.type || 'Unknown',
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        licensePlate: vehicleData.license_plate || 'Unknown',
        color: vehicleData.color || 'Unknown',
        image: vehicleData.image_url || undefined,
        vinNumber: vehicleData.vin_number || undefined,
        dateAdded: new Date(vehicleData.created_at),
        organizationId: vehicleData.organization_id || undefined
      };
    });

    // Ensure location data is properly formatted or set to undefined
    const locationData = washRequest.location ? {
      name: washRequest.location.name || "Unknown Location",
      address: washRequest.location.address ? 
        `${washRequest.location.address}, ${washRequest.location.city}, ${washRequest.location.state}` : 
        undefined,
      coordinates: (washRequest.location.latitude && washRequest.location.longitude) ? 
        { lat: washRequest.location.latitude, lng: washRequest.location.longitude } : 
        undefined
    } : undefined;

    // Format the data to match our application models
    // Ensure status is explicitly cast as WashStatus
    const status = washRequest.status as WashStatus;
    
    const formattedRequest = {
      id: washRequest.id,
      customerId: washRequest.user_id,
      vehicles: washVehicles.map(v => v.vehicle_id),
      vehicleDetails: vehicleDetails,
      preferredDates: {
        start: new Date(washRequest.preferred_date_start),
        end: washRequest.preferred_date_end ? new Date(washRequest.preferred_date_end) : undefined
      },
      status: status,
      technician: washRequest.technician_id,
      price: washRequest.price,
      notes: washRequest.notes,
      createdAt: new Date(washRequest.created_at),
      updatedAt: new Date(washRequest.updated_at),
      organizationId: washRequest.organization_id,
      locationId: washRequest.location_id,
      location: locationData
    };

    return formattedRequest;
  } catch (error) {
    console.error("Error getting full wash request:", error);
    return null;
  }
};
