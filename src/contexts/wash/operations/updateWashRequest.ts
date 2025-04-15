
import { toast } from "sonner";
import { acceptJob } from "./jobAcceptance";
import { patchWashRequest } from "./supabaseApi";

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
    
    if (data.technician) {
      console.log("Setting technician_id to:", data.technician);
      updateData.technician_id = data.technician;
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
      return true;
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
