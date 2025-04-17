
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Create vehicle associations for a wash request
 */
export const createVehicleAssociations = async (washRequestId: string, vehicleIds: string[]): Promise<boolean> => {
  const vehicleInserts = vehicleIds.map(vehicleId => ({
    wash_request_id: washRequestId,
    vehicle_id: vehicleId
  }));

  const { error } = await supabase
    .from('wash_request_vehicles')
    .insert(vehicleInserts);

  if (error) {
    console.error("Error creating vehicle associations:", error);
    toast.error("Failed to link vehicles to wash request");
    return false;
  }
  return true;
};
