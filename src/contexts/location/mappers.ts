
import { Location, SupabaseLocation } from "@/models/types";

// Map Supabase location to our app's Location type
export const mapSupabaseLocation = (data: SupabaseLocation): Location => {
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zip_code,
    latitude: data.latitude || undefined,
    longitude: data.longitude || undefined,
    notes: data.notes || undefined,
    isDefault: data.is_default || false,
    organizationId: data.organization_id || undefined,
    createdBy: data.created_by,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    vehicleCount: 0 // Will be populated in a separate query
  };
};
