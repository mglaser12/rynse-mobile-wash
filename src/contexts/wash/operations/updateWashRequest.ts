
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

    // Try direct PATCH API call as it's more reliable
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
      toast.error("Failed to update wash request");
      return false;
    }
  } catch (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
}

// Enhanced job acceptance function with two-step update process
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
    
    // STEP 1: Update technician_id first
    const technicianUpdatePayload = {
      technician_id: technicianId,
      updated_at: new Date().toISOString()
    };
    
    console.log("STEP 1: Updating technician_id with payload:", technicianUpdatePayload);
    
    const technicianResponse = await fetch(`${SUPABASE_URL}/rest/v1/wash_requests?id=eq.${requestId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(technicianUpdatePayload)
    });
    
    console.log("TECHNICIAN UPDATE RESPONSE:", {
      status: technicianResponse.status,
      statusText: technicianResponse.statusText,
      ok: technicianResponse.ok
    });
    
    if (!technicianResponse.ok) {
      console.error("Failed to update technician_id:", await technicianResponse.text());
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
    
    const statusResponse = await fetch(`${SUPABASE_URL}/rest/v1/wash_requests?id=eq.${requestId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(statusUpdatePayload)
    });
    
    console.log("STATUS UPDATE RESPONSE:", {
      status: statusResponse.status,
      statusText: statusResponse.statusText,
      ok: statusResponse.ok
    });
    
    if (statusResponse.ok) {
      console.log("Job acceptance successful - both updates completed!");
      toast.success("Job scheduled successfully!");
      return true;
    } else {
      console.error("Failed to update job status:", await statusResponse.text());
      toast.error("Job assigned but status update failed");
      return false;
    }
  } catch (error) {
    console.error("CRITICAL ERROR in job acceptance process:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
}
