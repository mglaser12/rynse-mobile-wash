
import { toast } from "sonner";
import { patchWashRequest } from "./supabaseApi";

/**
 * Enhanced job acceptance function with two-step update process
 */
export async function acceptJob(
  requestId: string, 
  technicianId: string, 
  preferredDates?: { start?: Date, end?: Date }
): Promise<boolean> {
  try {
    console.log(`ACCEPTING JOB: Request ID ${requestId} for technician ${technicianId}`);
    
    // Check if the technician ID is valid
    if (!technicianId || technicianId === "undefined") {
      console.error("ERROR: Invalid technician ID provided:", technicianId);
      toast.error("Invalid technician ID");
      return false;
    }
    
    // STEP 1: Update technician_id first
    const technicianUpdatePayload = {
      technician_id: technicianId,
      updated_at: new Date().toISOString()
    };
    
    console.log("STEP 1: Updating technician_id with payload:", technicianUpdatePayload);
    
    const technicianUpdateSuccess = await patchWashRequest(requestId, technicianUpdatePayload);
    
    if (!technicianUpdateSuccess) {
      console.error("Failed to update technician_id");
      toast.error("Failed to assign technician");
      return false;
    }
    
    // Add a small delay before the next update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // STEP 2: Update status and dates in a separate request
    const statusUpdatePayload: any = {
      status: 'confirmed',
      updated_at: new Date().toISOString()
    };

    // If a specific date was selected during scheduling
    if (preferredDates && preferredDates.start) {
      console.log("Setting scheduled date:", preferredDates.start);
      statusUpdatePayload.preferred_date_start = preferredDates.start.toISOString();
      
      // If end date is explicitly provided
      if (preferredDates.end) {
        statusUpdatePayload.preferred_date_end = preferredDates.end.toISOString();
      } else {
        // If scheduling for a single day, clear the end date
        statusUpdatePayload.preferred_date_end = null;
      }
    }

    console.log("STEP 2: Updating status with payload:", statusUpdatePayload);
    
    const statusUpdateSuccess = await patchWashRequest(requestId, statusUpdatePayload);
    
    if (statusUpdateSuccess) {
      console.log("Job acceptance successful - both updates completed!");
      toast.success("Job scheduled successfully!");
      return true;
    } else {
      console.error("Failed to update job status");
      toast.error("Job assigned but status update failed");
      return false;
    }
  } catch (error) {
    console.error("CRITICAL ERROR in job acceptance process:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
}
