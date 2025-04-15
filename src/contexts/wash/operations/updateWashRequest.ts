
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
    
    // For job acceptance, try a different approach - insert into database directly for immediate confirmation
    if (isJobAcceptance) {
      // First, let's check if someone else has already claimed this job
      const { data: currentData, error: checkError } = await supabase
        .from('wash_requests')
        .select('status, technician_id')
        .eq('id', id)
        .single();
        
      if (checkError) {
        console.error("Error checking current wash request state:", checkError);
        toast.error("Could not verify job availability");
        return false;
      }
      
      // If already claimed or not in pending state, abort
      if (currentData.status !== 'pending' || currentData.technician_id !== null) {
        console.error("Job already claimed or not in pending state:", currentData);
        toast.error("This job is no longer available");
        return false;
      }
      
      // Perform the update with a direct SQL insert for better atomicity
      const { error } = await supabase
        .from('wash_requests')
        .update(updateData)
        .eq('id', id)
        .eq('status', 'pending')  // Only update if still in pending state
        .is('technician_id', null);  // Only update if no technician assigned
      
      if (error) {
        console.error("Error updating wash request:", error);
        toast.error("Failed to accept job - someone may have claimed it first");
        return false;
      }
      
      // Verify the job was actually assigned by checking again
      await new Promise(r => setTimeout(r, 500)); // Small delay for DB consistency
      
      const { data: verifiedData, error: verifyError } = await supabase
        .from('wash_requests')
        .select('status, technician_id')
        .eq('id', id)
        .single();
        
      if (verifyError) {
        console.error("Error verifying job acceptance:", verifyError);
        toast.error("Couldn't confirm job acceptance");
        return false;
      }
      
      if (verifiedData.technician_id === data.technician && verifiedData.status === 'confirmed') {
        console.log("Job acceptance verified successfully");
        toast.success("Job accepted successfully!");
        return true;
      } else {
        console.error("Job acceptance failed - current state:", verifiedData);
        toast.error("Failed to accept job - please try again");
        return false;
      }
    } else {
      // For non-job acceptance updates, use the standard update approach
      const { error } = await supabase
        .from('wash_requests')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error("Error updating wash request:", error);
        toast.error("Failed to update wash request");
        return false;
      }
      
      // For status changes, verify the update
      if (data.status) {
        await new Promise(r => setTimeout(r, 300)); // Small delay for DB consistency
        
        const { data: verificationData, error: verificationError } = await supabase
          .from('wash_requests')
          .select('status')
          .eq('id', id)
          .single();
          
        if (verificationError || verificationData?.status !== data.status) {
          console.error("Status update verification failed:", verificationError || "Status mismatch");
          toast.error("Failed to update status");
          return false;
        }
      }
      
      console.log("Wash request updated successfully");
      toast.success("Wash request updated successfully");
      return true;
    }
  } catch (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
}
