
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logVehicleOperation, logVehicleResponse, logVehicleOperationStep } from "./logging";

export async function removeVehicle(id: string): Promise<boolean> {
  logVehicleOperation('REMOVE_VEHICLE', {}, id);
  
  try {
    // First remove any location associations
    logVehicleOperationStep('REMOVE_VEHICLE', 'Removing location associations', { vehicleId: id });
    const { error: locationError, data: removedLocations } = await supabase
      .from('location_vehicles')
      .delete()
      .eq('vehicle_id', id)
      .select('*');

    if (locationError) {
      logVehicleOperationStep('REMOVE_VEHICLE', 'Error removing location associations', locationError);
      console.error("Error removing vehicle location associations:", locationError);
      // Continue with deletion even if this fails
    } else {
      logVehicleOperationStep('REMOVE_VEHICLE', 'Location associations removed successfully', removedLocations);
    }

    // Delete from Supabase - no need to check user_id or organization_id
    // since we're allowing all users in the same org to delete any vehicle in their org
    logVehicleOperationStep('REMOVE_VEHICLE', 'Removing vehicle', { vehicleId: id });
    const { error, data: deletedVehicle } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      logVehicleOperationStep('REMOVE_VEHICLE', 'Vehicle removal error', error);
      console.error("Error removing vehicle from Supabase:", error);
      toast.error("Failed to remove vehicle");
      logVehicleResponse('REMOVE_VEHICLE', null, error);
      return false;
    }

    logVehicleOperationStep('REMOVE_VEHICLE', 'Vehicle removed successfully', deletedVehicle);
    toast.success("Vehicle removed successfully!");
    logVehicleResponse('REMOVE_VEHICLE', { success: true, removedVehicle: deletedVehicle });
    return true;
  } catch (error) {
    console.error("Error removing vehicle:", error);
    toast.error("Failed to remove vehicle");
    logVehicleResponse('REMOVE_VEHICLE', null, error);
    return false;
  }
}
