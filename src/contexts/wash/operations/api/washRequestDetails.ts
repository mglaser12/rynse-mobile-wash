
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, WashStatus, RecurringFrequency } from "@/models/types";

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
        location:location_id(id, name, address, city, state, latitude, longitude)
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
    let locationData = undefined;
    
    // First, check if washRequest exists and has a location property
    if (washRequest && washRequest.location) {
      // Check if location is an object and not an error response
      const locationValue = washRequest.location as unknown;
      
      // Only proceed if the location value looks like a valid object
      if (
        locationValue && 
        typeof locationValue === 'object' && 
        !Array.isArray(locationValue) && 
        !('error' in locationValue)
      ) {
        // Now we can safely cast it to our expected type
        const locationResponse = locationValue as {
          id: string;
          name: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          latitude: number | null;
          longitude: number | null;
        };
        
        // Process location data with proper type checking
        let locationName = "Unknown Location";
        
        if (locationResponse.name) {
          locationName = locationResponse.name;
        }
          
        // Only create address if all components are available
        let formattedAddress: string | undefined = undefined;
        
        if (locationResponse.address && 
            locationResponse.city && 
            locationResponse.state) {
          formattedAddress = `${locationResponse.address}, ${locationResponse.city}, ${locationResponse.state}`;
        }
        
        // Only create coordinates if both latitude and longitude are available
        let coordinates: { lat: number; lng: number } | undefined = undefined;
        
        if (locationResponse.latitude && 
            locationResponse.longitude) {
          coordinates = { 
            lat: locationResponse.latitude, 
            lng: locationResponse.longitude 
          };
        }
        
        // Create the location data object with all verified fields
        locationData = {
          name: locationName,
          address: formattedAddress,
          coordinates
        };
      } else {
        console.warn("Location data is not in expected format:", locationValue);
      }
    }

    // Format the data to match our application models
    // Ensure status is explicitly cast as WashStatus
    const status = washRequest.status as WashStatus;
    
    // Convert recurring_frequency from string to RecurringFrequency type
    let recurring = undefined;
    if (washRequest.recurring_frequency) {
      // Type assertion to ensure the frequency is a valid RecurringFrequency
      const frequency = washRequest.recurring_frequency as RecurringFrequency;
      recurring = {
        frequency,
        count: washRequest.recurring_count || undefined
      };
    }

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
      location: locationData,
      recurring: recurring
    };

    return formattedRequest;
  } catch (error) {
    console.error("Error getting full wash request:", error);
    return null;
  }
};
