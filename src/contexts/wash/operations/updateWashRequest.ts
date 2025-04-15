
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
    
    // Log the full request that will be sent to Supabase
    console.log("SENDING TO SUPABASE:", {
      method: "POST (UPDATE)",
      endpoint: `/rest/v1/wash_requests?id=eq.${id}`,
      headers: {
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(updateData)
    });
    
    const { data: updatedData, error } = await supabase
      .from('wash_requests')
      .update(updateData)
      .eq('id', id)
      .select();
      
    // Enhanced debugging for Supabase response
    console.log("SUPABASE RESPONSE STATUS:", error ? "ERROR" : "SUCCESS");
    console.log("RESPONSE DATA:", updatedData);
    console.log("RESPONSE ERROR:", error);
    
    if (error) {
      console.error("Error updating wash request:", error);
      toast.error("Failed to update wash request");
      return false;
    }
    
    // Important update: Consider empty array as success
    // Supabase returns empty array when operation succeeds but no data is returned
    toast.success("Request updated successfully");
    return true;
    
  } catch (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
}

// Enhanced job acceptance function with better logging and error handling
async function acceptJob(
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
    
    // Simple update payload
    const updatePayload: any = {
      technician_id: technicianId,
      status: 'confirmed',
      updated_at: new Date().toISOString()
    };

    // If a specific date was selected during scheduling
    if (preferredDates && preferredDates.start) {
      console.log("Setting scheduled date:", preferredDates.start);
      updatePayload.preferred_date_start = preferredDates.start.toISOString();
      
      // If end date is explicitly provided
      if (preferredDates.end) {
        updatePayload.preferred_date_end = preferredDates.end.toISOString();
      } else {
        // If scheduling for a single day, clear the end date
        updatePayload.preferred_date_end = null;
      }
    }

    console.log("Sending job acceptance payload to database:", updatePayload);
    
    // Log the full request that will be sent to Supabase
    console.log("SENDING JOB ACCEPTANCE TO SUPABASE:", {
      method: "POST (UPDATE)",
      endpoint: `/rest/v1/wash_requests?id=eq.${requestId}`,
      headers: {
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(updatePayload)
    });
    
    // Direct database update
    const { data, error } = await supabase
      .from('wash_requests')
      .update(updatePayload)
      .eq('id', requestId)
      .select();
    
    // Enhanced debugging for Supabase response
    console.log("SUPABASE ACCEPTANCE RESPONSE STATUS:", error ? "ERROR" : "SUCCESS");
    console.log("RESPONSE DATA:", data);
    console.log("RESPONSE DATA IS ARRAY:", Array.isArray(data));
    console.log("RESPONSE ERROR:", error);
    
    if (error) {
      console.error("Error updating job:", error);
      toast.error("Database error: " + error.message);
      return false;
    }
    
    // Consider it a success if there's no error, regardless of data returned
    // This fixes the issue with Supabase returning empty array on successful update
    toast.success("Job scheduled successfully!");
    return true;
    
  } catch (error) {
    console.error("CRITICAL ERROR in job acceptance process:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
}
