
import { WashRequest, WashStatus } from "@/models/types";

/**
 * Maps a Supabase wash request response to our application's WashRequest model
 */
export const mapToWashRequest = (
  data: any, 
  userId: string, 
  vehicleIds: string[],
  organizationId?: string
): WashRequest => {
  return {
    id: data.id,
    customerId: data.user_id || userId,
    vehicles: vehicleIds,
    preferredDates: {
      start: new Date(data.preferred_date_start),
      end: data.preferred_date_end ? new Date(data.preferred_date_end) : undefined
    },
    status: data.status as WashStatus,
    price: data.price,
    notes: data.notes || undefined,
    createdAt: new Date(data.created_at || Date.now()),
    updatedAt: new Date(data.updated_at || Date.now()),
    organizationId: data.organization_id || organizationId
  };
};

/**
 * Prepares data for inserting into the wash_requests table
 */
export const prepareWashRequestData = (
  userId: string,
  locationId: string,
  preferredDateStart: Date,
  preferredDateEnd: Date | undefined,
  price: number,
  notes: string | undefined,
  organizationId?: string
) => {
  return {
    user_id: userId,
    location_id: locationId,
    preferred_date_start: preferredDateStart.toISOString(),
    preferred_date_end: preferredDateEnd?.toISOString(),
    price,
    notes,
    status: 'pending' as WashStatus,
    organization_id: organizationId
  };
};
