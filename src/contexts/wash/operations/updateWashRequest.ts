
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
  
  // Special handling for job acceptance (technician claiming a job)
  if (data.status === 'confirmed' && data.technician) {
    console.log(`Technician ${data.technician} is trying to accept job ${id}`);
    return acceptJob(id, data.technician);
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

// Completely rewritten job acceptance function with simpler logic
async function acceptJob(requestId: string, technicianId: string): Promise<boolean> {
  try {
    // First, explicitly check if the job is still available
    const { data: job, error: fetchError } = await supabase
      .from('wash_requests')
      .select('technician_id, status')
      .eq('id', requestId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching job status:", fetchError);
      toast.error("Could not check job availability");
      return false;
    }
    
    if (!job || job.status !== 'pending' || job.technician_id !== null) {
      console.log("Job is no longer available:", job);
      toast.error("This job is no longer available");
      return false;
    }
    
    console.log("Job is available, attempting to claim it");
    
    // Direct update with specific conditions to prevent race conditions
    const { error: updateError, data: updateResult } = await supabase
      .from('wash_requests')
      .update({
        technician_id: technicianId,
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('status', 'pending')
      .is('technician_id', null)
      .select('technician_id, status');
      
    if (updateError) {
      console.error("Error updating job:", updateError);
      toast.error("Failed to accept job");
      return false;
    }
    
    // Check if the update was successful by looking at the returned data
    if (updateResult && updateResult.length > 0) {
      const updatedJob = updateResult[0];
      
      if (updatedJob.technician_id === technicianId && updatedJob.status === 'confirmed') {
        console.log("Job accepted successfully!");
        toast.success("Job accepted successfully!");
        return true;
      }
    }
    
    // If we get here, the update might not have affected any rows (someone else claimed it first)
    console.log("Job may have been claimed by another technician");
    toast.error("This job is no longer available");
    return false;
    
  } catch (error) {
    console.error("Error in job acceptance process:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
}
