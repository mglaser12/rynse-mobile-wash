
import { WashRequest } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function updateWashRequest(
  id: string, 
  data: Partial<WashRequest>
): Promise<boolean> {
  try {
    console.log(`Updating wash request ${id} with data:`, data);
    
    // Prepare the data for the update
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    // Map WashRequest fields to database column names
    if (data.status) {
      updateData.status = data.status;
      console.log(`Setting status to: ${data.status}`);
    }
    
    if (data.technician) {
      updateData.technician_id = data.technician;
      console.log(`Setting technician_id to: ${data.technician}`);
    }
    
    if (data.price !== undefined) {
      updateData.price = data.price;
    }
    
    if (data.notes) {
      updateData.notes = data.notes;
    }
    
    if (data.preferredDates) {
      if (data.preferredDates.start) {
        updateData.preferred_date_start = data.preferredDates.start.toISOString();
      }
      if (data.preferredDates.end) {
        updateData.preferred_date_end = data.preferredDates.end.toISOString();
      }
    }
    
    console.log("Final update data being sent to Supabase:", updateData);
    
    // Special handling for job acceptance - try multiple times if needed
    const isJobAcceptance = data.status === 'confirmed' && data.technician;
    
    if (isJobAcceptance) {
      return await handleJobAcceptance(id, updateData, data.technician!);
    } else {
      return await handleRegularUpdate(id, updateData, data);
    }
  } catch (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
}

// Function to handle job acceptance with special considerations
async function handleJobAcceptance(id: string, updateData: Record<string, any>, technicianId: string): Promise<boolean> {
  try {
    // First, directly fetch the current state of the request
    // This ensures we have the latest data before trying to update
    const { data: currentData, error: fetchError } = await supabase
      .from('wash_requests')
      .select('status, technician_id')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching current wash request state:", fetchError);
      toast.error("Could not verify job availability");
      return false;
    }
    
    // If already claimed or not in pending state, abort
    if (currentData.status !== 'pending' || currentData.technician_id !== null) {
      console.error("Job already claimed or not in pending state:", currentData);
      toast.error("This job is no longer available");
      return false;
    }
    
    // Use a different approach - direct update without conditions first
    const { error } = await supabase
      .from('wash_requests')
      .update({
        technician_id: technicianId,
        status: 'confirmed',
        updated_at: updateData.updated_at
      })
      .eq('id', id);
    
    if (error) {
      console.error("Error accepting job:", error);
      toast.error("Failed to accept job");
      return false;
    }
    
    // Verify the update by checking if the technician was set correctly
    const { data: verifyData, error: verifyError } = await supabase
      .from('wash_requests')
      .select('technician_id, status')
      .eq('id', id)
      .single();
      
    if (verifyError) {
      console.error("Error verifying job acceptance:", verifyError);
      toast.warning("Job status uncertain - please refresh");
      return false;
    }
    
    if (verifyData.technician_id !== technicianId || verifyData.status !== 'confirmed') {
      console.error("Failed to claim job - verification failed:", verifyData);
      toast.error("Failed to claim job - someone else may have claimed it");
      return false;
    }
    
    console.log("Job accepted successfully");
    toast.success("Job accepted successfully!");
    return true;
  } catch (error) {
    console.error("Error in job acceptance process:", error);
    toast.error("Failed to process job acceptance");
    return false;
  }
}

// Function to handle regular updates that are not job acceptances
async function handleRegularUpdate(id: string, updateData: Record<string, any>, originalData: Partial<WashRequest>): Promise<boolean> {
  // For non-job acceptance updates, use the standard update approach
  const { data, error } = await supabase
    .from('wash_requests')
    .update(updateData)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
  
  if (!data || data.length === 0) {
    console.error("No rows updated - request may not exist or you may not have permission");
    toast.error("Failed to update - request may no longer be available");
    return false;
  }
  
  console.log("Wash request updated successfully:", data);
  
  // For status changes, verify the update explicitly
  if (originalData.status) {
    const updatedRecord = data[0];
    if (updatedRecord.status !== originalData.status) {
      console.error("Status was not updated as expected", {
        expected: originalData.status,
        actual: updatedRecord.status
      });
      toast.error("Failed to update status - please try again");
      return false;
    }
  }
  
  toast.success("Wash request updated successfully");
  return true;
}
