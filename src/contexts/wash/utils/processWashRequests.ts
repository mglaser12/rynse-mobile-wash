
import { WashRequest, Vehicle, RecurringFrequency } from "@/models/types";

/**
 * Process the raw wash requests data from Supabase to match our app's format
 */
export const processWashRequests = (data: any[]): WashRequest[] => {
  if (!data || !Array.isArray(data)) {
    console.log("No wash requests data to process");
    return [];
  }
  
  return data.map(item => {
    // Extract and format vehicle data
    const vehicles = item.wash_request_vehicles?.map((v: any) => v.vehicle_id) || [];
    let vehicleDetails: Vehicle[] = [];
    
    // Map vehicle details if available
    if (item.wash_request_vehicles && Array.isArray(item.wash_request_vehicles)) {
      vehicleDetails = item.wash_request_vehicles.map((wrv: any) => {
        const vd = wrv.vehicles;
        if (!vd) return null;
        
        return {
          id: vd.id,
          customerId: vd.user_id,
          type: vd.type || "Unknown",
          make: vd.make,
          model: vd.model,
          year: vd.year,
          licensePlate: vd.license_plate || "Unknown",
          color: vd.color || "Unknown",
          image: vd.image_url,
          vinNumber: vd.vin_number,
          dateAdded: new Date(vd.created_at),
          organizationId: vd.organization_id
        };
      }).filter(Boolean);
    }
    
    // Build location data if available
    let location: any = undefined;
    if (item.location) {
      location = {
        name: item.location.name || "Unknown Location",
        address: item.location.address ? `${item.location.address}, ${item.location.city}, ${item.location.state}` : undefined,
        coordinates: item.location.latitude && item.location.longitude 
          ? { lat: item.location.latitude, lng: item.location.longitude }
          : undefined
      };
    }
    
    // Create recurring data if frequency is set
    let recurring = undefined;
    if (item.recurring_frequency) {
      // Type assertion to ensure it's a valid RecurringFrequency
      const frequency = item.recurring_frequency as RecurringFrequency;
      recurring = {
        frequency: frequency,
        count: item.recurring_count
      };
    }
    
    // Convert to our app's wash request format
    return {
      id: item.id,
      customerId: item.user_id,
      vehicles: vehicles,
      vehicleDetails: vehicleDetails,
      preferredDates: {
        start: new Date(item.preferred_date_start),
        end: item.preferred_date_end ? new Date(item.preferred_date_end) : undefined
      },
      price: item.price,
      notes: item.notes,
      status: item.status,
      technician: item.technician_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      organizationId: item.organization_id,
      locationId: item.location_id,
      location: location,
      recurring: recurring,
      vehicleWashStatuses: item.vehicle_wash_statuses || []
    };
  });
};
