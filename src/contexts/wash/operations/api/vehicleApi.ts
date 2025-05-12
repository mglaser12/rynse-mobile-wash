
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Create vehicle associations for a wash request
 */
export const createVehicleAssociations = async (washRequestId: string, vehicleIds: string[]): Promise<boolean> => {
  console.log(`Creating vehicle associations for wash request ${washRequestId}:`, vehicleIds);
  
  if (!vehicleIds || vehicleIds.length === 0) {
    console.log("No vehicles to associate, skipping.");
    return true;
  }
  
  const vehicleInserts = vehicleIds.map(vehicleId => ({
    wash_request_id: washRequestId,
    vehicle_id: vehicleId
  }));

  console.log("Inserting vehicle associations:", vehicleInserts);
  
  const { error } = await supabase
    .from('wash_request_vehicles')
    .insert(vehicleInserts);

  if (error) {
    console.error("Error creating vehicle associations:", error);
    toast.error("Failed to link vehicles to wash request");
    return false;
  }
  
  console.log("Vehicle associations created successfully");
  return true;
};
