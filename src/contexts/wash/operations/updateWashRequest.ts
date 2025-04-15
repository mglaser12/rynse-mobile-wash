
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Main function to update a wash request
export async function updateWashRequest(id: string, data: any): Promise<boolean> {
  console.log(`Updating wash request ${id} with data:`, data);

  // Check if this is a mock request (for demo purposes)
  if (id.startsWith('mock-')) {
    console.log("This is a mock request - simulating success");
    return true;
  }
  
  // Special handling for job acceptance
  if (data.status === 'confirmed' && data.technician) {
    return handleJobAcceptance(id, data.technician);
  }
  
  // Handle status changes like starting or completing a wash
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
    
    console.log("Final update data being sent to Supabase:", updateData);
    
    const { error } = await supabase
      .from('wash_requests')
      .update(updateData)
      .eq('id', id);
      
    if (error) {
      console.error("Error updating wash request:", error);
      toast.error("Failed to update wash request");
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
}

// Specialized function for job acceptance with improved reliability
async function handleJobAcceptance(requestId: string, technicianId: string): Promise<boolean> {
  try {
    console.log(`Handling job acceptance for request ${requestId} by technician ${technicianId}`);
    
    // First check if the job is still available
    const { data: currentJobStatus, error: checkError } = await supabase
      .from('wash_requests')
      .select('status, technician_id')
      .eq('id', requestId)
      .single();
    
    if (checkError) {
      console.error("Error checking job status:", checkError);
      toast.error("Failed to check job status");
      return false;
    }
    
    // If job is already taken or not pending, return false
    if (currentJobStatus.status !== 'pending' || currentJobStatus.technician_id !== null) {
      console.log("Job is no longer available:", currentJobStatus);
      toast.error("This job is no longer available");
      return false;
    }
    
    // Prepare the update data
    const updateData = {
      updated_at: new Date().toISOString(),
      technician_id: technicianId,
      status: 'confirmed'
    };
    
    console.log("Attempting to claim job with data:", updateData);
    
    // Use a transaction to ensure atomicity of the update
    // Attempt to update the job status to confirmed and assign the technician
    const { error: updateError } = await supabase
      .from('wash_requests')
      .update(updateData)
      .eq('id', requestId)
      .eq('status', 'pending')
      .is('technician_id', null);
      
    if (updateError) {
      console.error("Error updating job status:", updateError);
      toast.error("Failed to accept job");
      return false;
    }
    
    // Verify the update was successful
    const { data: verificationData, error: verificationError } = await supabase
      .from('wash_requests')
      .select('technician_id, status')
      .eq('id', requestId)
      .single();
      
    if (verificationError) {
      console.error("Error verifying job acceptance:", verificationError);
      toast.error("Failed to verify job acceptance");
      return false;
    }
    
    console.log("Job verification result:", verificationData);
    
    // Check that the technician ID matches and the status is confirmed
    if (verificationData.technician_id === technicianId && verificationData.status === 'confirmed') {
      console.log("Job accepted successfully!");
      toast.success("Job accepted successfully!");
      return true;
    } else {
      console.error("Job verification failed:", verificationData);
      toast.error("Failed to accept job - it may have been claimed by another technician");
      return false;
    }
    
  } catch (error) {
    console.error("Critical error in handleJobAcceptance:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
}
