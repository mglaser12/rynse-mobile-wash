
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define constants for Supabase API URL and key
// We'll use the same values from our Supabase client configuration
const SUPABASE_URL = "https://ebzruvonvlowdglrmduf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVienJ1dm9udmxvd2RnbHJtZHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NzAzNTEsImV4cCI6MjA2MDI0NjM1MX0.1Hdcd2TyWfmGo6-1xIif2XoF8a14v7iHRRk7Tlw7DC0";

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

    // Try direct REST API call first as it's more reliable
    try {
      console.log("Attempting direct PATCH to Supabase REST API...");
      const response = await fetch(`${SUPABASE_URL}/rest/v1/wash_requests?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'  // Use minimal for better performance
        },
        body: JSON.stringify(updateData)
      });
      
      console.log("DIRECT API RESPONSE:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        console.log("Direct API update successful!");
        toast.success("Request updated successfully");
        return true;
      } else {
        console.error("Direct API update failed:", await response.text());
      }
    } catch (directError) {
      console.error("Error with direct API call:", directError);
    }
    
    // Fall back to supabase client method if direct method fails
    console.log("Trying Supabase client update method as fallback...");
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
    
    // Try direct PATCH request first as it's more reliable
    try {
      console.log("Trying direct PATCH request...");
      const directResponse = await fetch(`${SUPABASE_URL}/rest/v1/wash_requests?id=eq.${requestId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'  // Use minimal for better performance
        },
        body: JSON.stringify(updatePayload)
      });
      
      console.log("DIRECT API RESPONSE:", {
        status: directResponse.status,
        statusText: directResponse.statusText,
        ok: directResponse.ok
      });
      
      if (directResponse.ok) {
        console.log("Direct API update successful!");
        toast.success("Job scheduled successfully!");
        return true;
      } else {
        const errorText = await directResponse.text();
        console.error(`Direct API update failed: Status ${directResponse.status}`, errorText);
      }
    } catch (directError) {
      console.error("Error with direct API call:", directError);
    }
    
    // Fall back to client method
    console.log("Falling back to Supabase client method...");
    const { error } = await supabase
      .from('wash_requests')
      .update(updatePayload)
      .eq('id', requestId);
    
    if (error) {
      console.error("Error updating job:", error);
      toast.error("Database error: " + error.message);
      return false;
    }
    
    toast.success("Job scheduled successfully!");
    return true;
    
  } catch (error) {
    console.error("CRITICAL ERROR in job acceptance process:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
}
