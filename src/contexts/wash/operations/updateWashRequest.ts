
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VERIFICATION_TIMEOUT = 1500; // 1.5 seconds for database consistency checks

// Helper function to verify job acceptance went through
const verifyJobAcceptance = async (requestId: string, technicianId: string) => {
  try {
    // Wait a small delay to allow database replication
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if the job has actually been updated in the database
    const { data, error } = await supabase
      .from('wash_requests')
      .select('technician_id, status')
      .eq('id', requestId)
      .single();

    if (error) {
      console.error("Error verifying job acceptance:", error);
      return false;
    }
    
    console.log("Job acceptance verification results:", data);
    
    // Compare technician_id and check status is now 'confirmed'
    if (data.technician_id === technicianId && data.status === 'confirmed') {
      console.log("Job acceptance verified successfully");
      return true;
    } else {
      console.log("Failed to claim job - verification failed:", data);
      return false;
    }
  } catch (error) {
    console.error("Error in verifyJobAcceptance:", error);
    return false;
  }
};

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
  
  // Handle other update types
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

// Specialized function for job acceptance with verification
async function handleJobAcceptance(requestId: string, technicianId: string): Promise<boolean> {
  try {
    console.log(`Handling job acceptance for request ${requestId} by technician ${technicianId}`);
    
    // First, attempt to claim the job (set technician_id and change status)
    const updateData = {
      updated_at: new Date().toISOString(),
      technician_id: technicianId,
      status: 'confirmed'
    };
    
    // Fixed: Use a better update query that doesn't check existing technician_id
    // which was causing race conditions
    const { error } = await supabase
      .from('wash_requests')
      .update(updateData)
      .eq('id', requestId)
      .eq('status', 'pending'); // Only update if still pending
      
    if (error) {
      console.error("Error in job acceptance transaction:", error);
      toast.error("Failed to accept job. Please try again.");
      return false;
    }
    
    // Additional direct fetch to see if our update worked
    const { data: updatedData } = await supabase
      .from('wash_requests')
      .select('technician_id, status')
      .eq('id', requestId)
      .single();
      
    if (updatedData?.technician_id === technicianId) {
      console.log("Job claimed successfully in first check:", updatedData);
      toast.success("Job accepted successfully!");
      return true;
    }
    
    // If we couldn't verify immediate success, try the original verification process
    let verified = false;
    let verificationAttempts = 0;
    const maxVerificationAttempts = 3;
    
    while (!verified && verificationAttempts < maxVerificationAttempts) {
      verificationAttempts++;
      console.log(`Verification attempt ${verificationAttempts}...`);
      
      verified = await verifyJobAcceptance(requestId, technicianId);
      
      if (verified) {
        console.log("Job acceptance verified!");
        toast.success("Job accepted successfully!");
        return true;
      }
      
      // Wait before trying again
      if (!verified && verificationAttempts < maxVerificationAttempts) {
        await new Promise(resolve => setTimeout(resolve, VERIFICATION_TIMEOUT / maxVerificationAttempts));
      }
    }
    
    if (!verified) {
      console.error("Failed to verify job acceptance after multiple attempts.");
      toast.error("This job may have been claimed by another technician.");
      return false;
    }
    
    return false;
  } catch (error) {
    console.error("Critical error in handleJobAcceptance:", error);
    toast.error("An unexpected error occurred.");
    return false;
  }
}
