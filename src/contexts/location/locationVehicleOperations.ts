
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Assign a vehicle to a location
export async function assignVehicleToLocation(vehicleId: string, locationId: string): Promise<boolean> {
  try {
    // Check if this mapping already exists
    const { data: existingMapping } = await supabase
      .from('location_vehicles')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('location_id', locationId)
      .maybeSingle();
      
    if (existingMapping) {
      // Already assigned, no need to do anything
      return true;
    }
    
    // First, remove any existing location assignment for this vehicle
    await removeVehicleFromAllLocations(vehicleId);
    
    // Now create the new assignment
    const { error } = await supabase
      .from('location_vehicles')
      .insert({
        vehicle_id: vehicleId,
        location_id: locationId
      });
      
    if (error) {
      console.error("Error assigning vehicle to location:", error);
      toast.error("Failed to assign vehicle to location");
      return false;
    }
    
    toast.success("Vehicle assigned to location successfully");
    return true;
  } catch (error) {
    console.error("Error in assignVehicleToLocation:", error);
    toast.error("Failed to assign vehicle to location");
    return false;
  }
}

// Remove a vehicle from a specific location
export async function removeVehicleFromLocation(vehicleId: string, locationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('location_vehicles')
      .delete()
      .eq('vehicle_id', vehicleId)
      .eq('location_id', locationId);
      
    if (error) {
      console.error("Error removing vehicle from location:", error);
      toast.error("Failed to remove vehicle from location");
      return false;
    }
    
    toast.success("Vehicle removed from location successfully");
    return true;
  } catch (error) {
    console.error("Error in removeVehicleFromLocation:", error);
    toast.error("Failed to remove vehicle from location");
    return false;
  }
}

// Remove a vehicle from all locations (used when reassigning a vehicle)
export async function removeVehicleFromAllLocations(vehicleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('location_vehicles')
      .delete()
      .eq('vehicle_id', vehicleId);
      
    if (error) {
      console.error("Error removing vehicle from all locations:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removeVehicleFromAllLocations:", error);
    return false;
  }
}

// Get the location ID for a specific vehicle
export async function getLocationForVehicle(vehicleId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('location_vehicles')
      .select('location_id')
      .eq('vehicle_id', vehicleId)
      .maybeSingle();
      
    if (error || !data) {
      return null;
    }
    
    return data.location_id;
  } catch (error) {
    console.error("Error in getLocationForVehicle:", error);
    return null;
  }
}

// Get all vehicles for a specific location
export async function getVehiclesForLocation(locationId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('location_vehicles')
      .select('vehicle_id')
      .eq('location_id', locationId);
      
    if (error || !data) {
      return [];
    }
    
    return data.map(item => item.vehicle_id);
  } catch (error) {
    console.error("Error in getVehiclesForLocation:", error);
    return [];
  }
}
