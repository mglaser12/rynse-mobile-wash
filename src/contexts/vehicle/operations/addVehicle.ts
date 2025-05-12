
import { Vehicle } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDbVehicleToVehicle } from "./mappers";
import { uploadVehicleImageToStorage } from "./utils";
import { logVehicleOperation, logVehicleResponse, logVehicleOperationStep } from "./logging";

export async function addVehicle(
  user: { id: string; organizationId?: string } | null, 
  vehicleData: Omit<Vehicle, "id" | "dateAdded"> & { locationId?: string }
): Promise<Vehicle | null> {
  logVehicleOperation('ADD_VEHICLE', vehicleData);

  if (!user) {
    logVehicleOperationStep('ADD_VEHICLE', 'No user provided', { user });
    toast.error("You need to be logged in to add a vehicle");
    return null;
  }

  try {
    // Extract locationId from the vehicleData
    const { locationId, ...vehicleInsertData } = vehicleData;
    logVehicleOperationStep('ADD_VEHICLE', 'Extracted locationId', { locationId, vehicleData: vehicleInsertData });

    // Convert image to a file for storage if it's a base64 string
    let imageUrl = vehicleData.image;
    if (vehicleData.image && vehicleData.image.startsWith('data:image')) {
      logVehicleOperationStep('ADD_VEHICLE', 'Processing image upload', { imageType: typeof vehicleData.image, imageLength: vehicleData.image.length });
      const { path, error: uploadError } = await uploadVehicleImageToStorage(vehicleData.image, supabase);
      if (uploadError) {
        logVehicleOperationStep('ADD_VEHICLE', 'Image upload error', uploadError);
        throw uploadError;
      }
      imageUrl = path;
      logVehicleOperationStep('ADD_VEHICLE', 'Image uploaded successfully', { path });
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
      organization_id: vehicleData.organizationId || null,
      asset_number: vehicleData.assetNumber || null // Add asset number to insertion data
    };
    logVehicleOperationStep('ADD_VEHICLE', 'Prepared insert data', insertData);

    // Insert the vehicle
    logVehicleOperationStep('ADD_VEHICLE', 'Sending insert request to Supabase');
    const { data: vehicleData1, error: insertError } = await supabase
      .from('vehicles')
      .insert(insertData)
      .select('*')
      .single();

    if (insertError) {
      logVehicleOperationStep('ADD_VEHICLE', 'Insert error', insertError);
      throw insertError;
    }

    logVehicleOperationStep('ADD_VEHICLE', 'Vehicle inserted successfully', vehicleData1);

    // If locationId is provided, create a location-vehicle association
    if (locationId) {
      logVehicleOperationStep('ADD_VEHICLE', 'Creating location association', { vehicleId: vehicleData1.id, locationId });
      const { data: locationData, error: locationVehicleError } = await supabase
        .from('location_vehicles')
        .insert({
          location_id: locationId,
          vehicle_id: vehicleData1.id
        })
        .select('*')
        .single();

      if (locationVehicleError) {
        logVehicleOperationStep('ADD_VEHICLE', 'Location association error', locationVehicleError);
        console.error("Error creating location association:", locationVehicleError);
        toast.error("Vehicle saved, but location assignment failed.");
      } else {
        logVehicleOperationStep('ADD_VEHICLE', 'Location association created successfully', locationData);
      }
    }

    // Return the vehicle data mapped to our Vehicle type
    const mappedVehicle = mapDbVehicleToVehicle(vehicleData1);
    logVehicleResponse('ADD_VEHICLE', mappedVehicle);
    return mappedVehicle;
  } catch (error) {
    console.error("Error adding vehicle:", error);
    toast.error("Failed to add vehicle");
    logVehicleResponse('ADD_VEHICLE', null, error);
    return null;
  }
}
