
import { toast } from "sonner";
import { acceptJob } from "./jobAcceptance";
import { patchWashRequest } from "./supabaseApi";
import { supabase } from "@/integrations/supabase/client";
import { createVehicleAssociations } from "./api";

/**
 * Main function to update a wash request
 */
export async function updateWashRequest(id: string, data: any): Promise<boolean> {
  console.log(`Updating wash request ${id} with data:`, data);

  // Check if this is a mock request (for demo purposes)
  if (id.startsWith('mock-')) {
    console.log("This is a mock request - simulating success");
    toast.success("Update successful (demo mode)");
    return true;
  }
  
  // Special handling for job acceptance (technician claiming a job)
  if (data.status === 'confirmed' && data.technician) {
    console.log(`Technician ${data.technician} is trying to accept job ${id}`);
    
    // Debugging: Log full details of the acceptance request
    console.log("Full acceptance data:", JSON.stringify(data, null, 2));
    
    return await acceptJob(id, data.technician, data.preferredDates);
  }
  
  // Handle all other status changes
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Add fields that need to be updated
    if (data.status) {
      console.log("Setting status to:", data.status);
      updateData.status = data.status;
    }
    
    // Handle technician assignment/unassignment
    if (data.technician !== undefined) {
      if (data.technician === null) {
        console.log("Clearing technician_id");
        updateData.technician_id = null;
      } else {
        console.log("Setting technician_id to:", data.technician);
        updateData.technician_id = data.technician;
      }
    }
    
    // Handle location change
    if (data.locationId) {
      console.log("Setting location_id to:", data.locationId);
      updateData.location_id = data.locationId;
    }

    // Handle vehicle changes - FIXED: Now properly handling through junction table
    let vehicleUpdateSuccess = true;
    if (data.vehicleIds) {
      console.log("Processing vehicle IDs:", data.vehicleIds);
      
      try {
        // Step 1: Delete existing vehicle associations
        console.log(`Deleting existing vehicle associations for wash request: ${id}`);
        const { error: deleteError } = await supabase
          .from('wash_request_vehicles')
          .delete()
          .eq('wash_request_id', id);
          
        if (deleteError) {
          console.error("Error deleting existing vehicle associations:", deleteError);
          toast.error("Failed to update vehicle selections");
          return false;
        }
        
        // Step 2: Create new vehicle associations
        console.log(`Creating new vehicle associations for wash request: ${id}`, data.vehicleIds);
        vehicleUpdateSuccess = await createVehicleAssociations(id, data.vehicleIds);
        
        if (!vehicleUpdateSuccess) {
          console.error("Failed to create new vehicle associations");
          return false;
        }
      } catch (vehicleError) {
        console.error("Error updating vehicle associations:", vehicleError);
        return false;
      }
    }
    
    if (data.notes) {
      updateData.notes = data.notes;
    }
    
    // Handle date updates for scheduling
    if (data.preferredDates) {
      if (data.preferredDates.start) {
        console.log("Setting preferred_date_start to:", data.preferredDates.start);
        updateData.preferred_date_start = data.preferredDates.start.toISOString();
      }
      if (data.preferredDates.end) {
        console.log("Setting preferred_date_end to:", data.preferredDates.end);
        updateData.preferred_date_end = data.preferredDates.end.toISOString();
      } else if (data.preferredDates.end === undefined && Object.hasOwnProperty.call(data.preferredDates, 'end')) {
        // If end is explicitly set to undefined, clear the end date
        updateData.preferred_date_end = null;
      }
    }
    
    console.log("Final update data being sent to Supabase:", updateData);

    const success = await patchWashRequest(id, updateData);
    
    if (success) {
      console.log("Update successful!");
      toast.success("Request updated successfully");
      return vehicleUpdateSuccess && true;
    } else {
      console.error("Update failed");
      toast.error("Failed to update wash request");
      return false;
    }
  } catch (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
}
