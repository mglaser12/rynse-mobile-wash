
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
    const maxRetries = isJobAcceptance ? 3 : 1;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      attempt++;
      
      if (attempt > 1) {
        console.log(`Attempt ${attempt} to update wash request...`);
      }
      
      // Perform the update
      const { error } = await supabase
        .from('wash_requests')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        if (attempt < maxRetries) {
          // Wait a bit before retrying
          await new Promise(r => setTimeout(r, 500));
          continue;
        }
        
        console.error("Error updating wash request:", error);
        toast.error("Failed to update wash request");
        return false;
      }
      
      // Verify the update actually took effect in the database
      const { data: verificationData, error: verificationError } = await supabase
        .from('wash_requests')
        .select('status, technician_id')
        .eq('id', id)
        .maybeSingle();
        
      if (verificationError) {
        console.error("Error verifying update:", verificationError);
        if (attempt < maxRetries) {
          console.log("Update verification failed, retrying...");
          await new Promise(r => setTimeout(r, 500));
          continue;
        }
        toast.error("Failed to confirm update");
        return false;
      }
      
      // Check if our intended changes were actually applied
      if (isJobAcceptance && 
          (verificationData?.status !== 'confirmed' || 
           verificationData?.technician_id !== data.technician)) {
        if (attempt < maxRetries) {
          console.log("Update verification failed, retrying...");
          await new Promise(r => setTimeout(r, 500));
          continue;
        }
        console.error("Failed to verify update after multiple attempts");
        toast.error("Failed to confirm job acceptance");
        return false;
      }
      
      // If there was no error, we consider the update successful
      console.log("Wash request updated and verified successfully");
      
      // Success - show confirmation message
      if (isJobAcceptance) {
        toast.success("Job accepted successfully!");
      } else {
        toast.success("Wash request updated successfully");
      }
      
      return true;
    }
    
    // If we reach here, all attempts failed
    toast.error("Failed to update after multiple attempts");
    return false;
  } catch (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
}
