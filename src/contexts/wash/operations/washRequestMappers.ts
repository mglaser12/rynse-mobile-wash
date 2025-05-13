
import { 
  WashRequest, 
  SupabaseWashRequest, 
  SupabaseWashRequestVehicle,
  SupabaseVehicle,
  Vehicle,
  Location,
  SupabaseLocation
} from "@/models/types";

/**
 * Map a wash request from the Supabase format to our application format
 */
export function mapWashRequest(
  washRequest: SupabaseWashRequest,
  vehicles: SupabaseWashRequestVehicle[] = [],
  vehicleDetails?: SupabaseVehicle[],
  locationDetail?: SupabaseLocation | null
): WashRequest {
  // Map vehicles if we have vehicle details
  const mappedVehicleDetails = vehicleDetails?.map(mapVehicleFromSupabase);
  
  // Map location if we have location details
  let mappedLocation: Location | undefined = undefined;
  if (locationDetail) {
    mappedLocation = {
      id: locationDetail.id,
      name: locationDetail.name,
      address: locationDetail.address,
      city: locationDetail.city,
      state: locationDetail.state,
      zipCode: locationDetail.zip_code,
      latitude: locationDetail.latitude || undefined,
      longitude: locationDetail.longitude || undefined,
      notes: locationDetail.notes || undefined,
      isDefault: locationDetail.is_default || false,
      organizationId: locationDetail.organization_id || undefined,
      createdBy: locationDetail.created_by,
      createdAt: new Date(locationDetail.created_at),
      updatedAt: new Date(locationDetail.updated_at)
    };
  }

  // Get recurring information if available
  const recurringFrequency = washRequest.recurring_frequency;
  
  return {
    id: washRequest.id,
    customerId: washRequest.user_id,
    vehicles: vehicles.map(vehicle => vehicle.vehicle_id),
    vehicleDetails: mappedVehicleDetails,
    preferredDates: {
      start: new Date(washRequest.preferred_date_start),
      end: washRequest.preferred_date_end ? new Date(washRequest.preferred_date_end) : undefined,
    },
    status: washRequest.status as any,
    technician: washRequest.technician_id || undefined,
    price: Number(washRequest.price),
    notes: washRequest.notes || undefined,
    createdAt: new Date(washRequest.created_at),
    updatedAt: new Date(washRequest.updated_at),
    organizationId: washRequest.organization_id,
    locationId: washRequest.location_id || undefined,
    locationDetail: mappedLocation,
    location: mappedLocation ? {
      name: mappedLocation.name,
      address: mappedLocation.address
    } : undefined,
    ...(recurringFrequency && recurringFrequency !== 'none' && {
      recurring: {
        frequency: recurringFrequency as any,
        count: washRequest.recurring_count
      }
    })
  };
}

/**
 * Map a vehicle from the Supabase format to our application format
 */
export function mapVehicleFromSupabase(vehicle: SupabaseVehicle): Vehicle {
  return {
    id: vehicle.id,
    customerId: vehicle.user_id,
    type: vehicle.type || "",
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    licensePlate: vehicle.license_plate || "",
    color: vehicle.color || "",
    image: vehicle.image_url || undefined,
    vinNumber: vehicle.vin_number || undefined,
    dateAdded: new Date(vehicle.created_at),
    organizationId: vehicle.organization_id || undefined,
    assetNumber: vehicle.asset_number || undefined
  };
}
