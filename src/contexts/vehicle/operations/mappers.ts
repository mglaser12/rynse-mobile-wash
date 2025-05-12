
import { Vehicle, SupabaseVehicle } from "@/models/types";

// Helper function to map data from the database to our Vehicle type
export function mapDbVehicleToVehicle(dbVehicle: SupabaseVehicle): Vehicle {
  return {
    id: dbVehicle.id,
    customerId: dbVehicle.user_id,
    make: dbVehicle.make,
    model: dbVehicle.model,
    year: dbVehicle.year,
    licensePlate: dbVehicle.license_plate || '',
    color: dbVehicle.color || '',
    type: dbVehicle.type || '',
    vinNumber: dbVehicle.vin_number || undefined,
    image: dbVehicle.image_url || undefined,
    dateAdded: new Date(dbVehicle.created_at),
    organizationId: dbVehicle.organization_id || undefined,
    assetNumber: dbVehicle.asset_number || undefined, // Map the asset_number field
  };
}
