
import { Vehicle } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDbVehicleToVehicle } from "./mappers";
import { uploadVehicleImageToStorage } from "./utils";

export async function addVehicle(
  user: { id: string; organizationId?: string } | null, 
  vehicleData: Omit<Vehicle, "id" | "dateAdded"> & { locationId?: string }
): Promise<Vehicle | null> {
  if (!user) {
    toast.error("You need to be logged in to add a vehicle");
    return null;
  }

  try {
    // Extract locationId from the vehicleData
    const { locationId, ...vehicleInsertData } = vehicleData;

    // Convert image to a file for storage if it's a base64 string
    let imageUrl = vehicleData.image;
    if (vehicleData.image && vehicleData.image.startsWith('data:image')) {
      const { path, error: uploadError } = await uploadVehicleImageToStorage(vehicleData.image, supabase);
      if (uploadError) throw uploadError;
      imageUrl = path;
    }

    // Prepare data for insertion
    const insertData = {
      user_id: user.id,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      license_plate: vehicleData.licensePlate || null,
      color: vehicleData.color || null,
      type: vehicleData.type || null,
      vin_number: vehicleData.vinNumber || null,
      image_url: imageUrl || null,
      organization_id: vehicleData.organizationId || null
    };

    // Insert the vehicle
    const { data: vehicleData1, error: insertError } = await supabase
      .from('vehicles')
      .insert(insertData)
      .select('*')
      .single();

    if (insertError) throw insertError;

    // If locationId is provided, create a location-vehicle association
    if (locationId) {
      const { error: locationVehicleError } = await supabase
        .from('location_vehicles')
        .insert({
          location_id: locationId,
          vehicle_id: vehicleData1.id
        });

      if (locationVehicleError) {
        console.error("Error creating location association:", locationVehicleError);
        toast.error("Vehicle saved, but location assignment failed.");
      }
    }

    // Return the vehicle data mapped to our Vehicle type
    return mapDbVehicleToVehicle(vehicleData1);
  } catch (error) {
    console.error("Error adding vehicle:", error);
    toast.error("Failed to add vehicle");
    return null;
  }
}
