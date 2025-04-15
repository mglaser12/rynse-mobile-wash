
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Main function to update a wash request
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
    
    toast.success("Request updated successfully");
    return true;
    
  } catch (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
}

// Simplified job acceptance function - no complex verification
async function acceptJob(requestId: string, technicianId: string): Promise<boolean> {
  try {
    console.log(`Accepting job ${requestId} for technician ${technicianId}`);
    
    // Perform a simple, direct update without conditions
    const { error } = await supabase
      .from('wash_requests')
      .update({
        technician_id: technicianId,
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);
    
    if (error) {
      console.error("Error accepting job:", error);
      toast.error("Failed to accept job");
      return false;
    }
    
    console.log("Job accepted successfully");
    toast.success("Job accepted successfully!");
    return true;
    
  } catch (error) {
    console.error("Error in job acceptance process:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
}
