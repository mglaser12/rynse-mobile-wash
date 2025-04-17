
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/models/types";
import { useVehicles } from "@/contexts/VehicleContext";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { VehicleImageUploader } from "./VehicleImageUploader";
import { VehicleFormFields, VehicleFormData } from "./VehicleFormFields";
import { DeleteVehicleDialog } from "./DeleteVehicleDialog";

interface EditVehicleFormProps {
  vehicle: Vehicle;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function EditVehicleForm({ vehicle, onCancel, onSuccess }: EditVehicleFormProps) {
  const { updateVehicle, removeVehicle } = useVehicles();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [vehicleData, setVehicleData] = useState<VehicleFormData & {image?: string}>({
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    licensePlate: vehicle.licensePlate,
    type: vehicle.type,
    color: vehicle.color,
    vinNumber: vehicle.vinNumber,
    image: vehicle.image,
    locationId: "", // Initialize with empty string, will be populated if needed
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (image: string | undefined) => {
    setVehicleData((prev) => ({ ...prev, image }));
  };
  
  const handleLocationChange = (locationId: string) => {
    setVehicleData(prev => ({ ...prev, locationId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!vehicleData.make || !vehicleData.model || !vehicleData.year) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    try {
      const { locationId, ...vehicleUpdateData } = vehicleData;
      await updateVehicle(vehicle.id, 
        locationId ? { ...vehicleUpdateData, locationId } : vehicleUpdateData
      );
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating vehicle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeVehicle(vehicle.id);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error removing vehicle:", error);
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Edit Vehicle</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <VehicleFormFields 
          vehicleData={vehicleData}
          onInputChange={handleInputChange}
          onLocationChange={handleLocationChange}
          disabled={isLoading || isDeleting}
          locationRequired={false}
        />
        
        <div>
          <Label>Vehicle Image</Label>
          <VehicleImageUploader
            currentImage={vehicleData.image}
            onImageChange={handleImageChange}
            disabled={isLoading || isDeleting}
          />
        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)} 
            disabled={isLoading || isDeleting}
          >
            <X className="mr-2 h-4 w-4" />
            Delete Vehicle
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isLoading || isDeleting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isDeleting}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      <DeleteVehicleDialog 
        isOpen={showDeleteDialog}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        vehicleName={`${vehicle.make} ${vehicle.model}`}
      />
    </div>
  );
}
