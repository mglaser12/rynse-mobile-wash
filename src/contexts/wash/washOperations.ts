
import { WashRequest, WashStatus } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function createWashRequest(
  user: { id: string } | null,
  washRequestData: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">
): Promise<WashRequest | null> {
  if (!user) {
    toast.error("You must be logged in to create a wash request");
    return null;
  }

  try {
    const { customerId, vehicles, preferredDates, price, notes } = washRequestData;
    
    // Insert new wash request in Supabase
    const { data, error } = await supabase
      .from('wash_requests')
      .insert({
        user_id: user.id,
        preferred_date_start: preferredDates.start.toISOString(),
        preferred_date_end: preferredDates.end?.toISOString(),
        price,
        notes,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) {
      console.error("Error adding wash request to Supabase:", error);
      toast.error("Failed to create wash request");
      return null;
    }

    // Create vehicle associations
    const vehicleInserts = vehicles.map(vehicleId => ({
      wash_request_id: data.id,
      vehicle_id: vehicleId
    }));

    const { error: vehicleError } = await supabase
      .from('wash_request_vehicles')
      .insert(vehicleInserts);

    if (vehicleError) {
      console.error("Error creating vehicle associations:", vehicleError);
      toast.error("Failed to link vehicles to wash request");
      // We should handle this better, but for now we'll continue
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
      updatedAt: new Date(data.updated_at)
    };
    
    toast.success("Wash request created successfully!");
    return newWashRequest;
  } catch (error) {
    console.error("Error creating wash request:", error);
    toast.error("Failed to create wash request");
    return null;
  }
}

export async function cancelWashRequest(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wash_requests')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error("Error cancelling wash request:", error);
      toast.error("Failed to cancel wash request");
      return false;
    }
    
    toast.success("Wash request cancelled successfully!");
    return true;
  } catch (error) {
    console.error("Error cancelling wash request:", error);
    toast.error("Failed to cancel wash request");
    return false;
  }
}
