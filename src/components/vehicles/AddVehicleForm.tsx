
import React from "react";
import { Vehicle } from "@/models/types";
import { VehicleFormFields } from "./VehicleFormFields";
import { VehicleImageUploader } from "./VehicleImageUploader";
import { OcrSection } from "./OcrSection";
import { FormActions } from "./FormActions";
import { useAddVehicleForm } from "./useAddVehicleForm";
import { DialogTitle } from "@/components/ui/dialog";

interface AddVehicleFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export function AddVehicleForm({ onCancel, onSuccess }: AddVehicleFormProps) {
  const {
    vehicleData,
    isLoading,
    ocrInProgress,
    setOcrInProgress,
    handleInputChange,
    handleSubmit,
    updateVehicleData,
    setVehicleData,
    handleLocationChange
  } = useAddVehicleForm({ onSuccess });

  const isNewVehicle = true; // This is always true in the AddVehicleForm
  const showAllFields = !isNewVehicle || vehicleData.locationId;

  return (
    <div>
      <DialogTitle className="text-lg font-medium mb-4">Add New Vehicle</DialogTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        <VehicleFormFields 
          vehicleData={vehicleData}
          onInputChange={handleInputChange}
          onLocationChange={handleLocationChange}
          disabled={isLoading}
          locationRequired={true}
        />
        
        {/* Only for new vehicles, require location selection before showing these sections */}
        {(isNewVehicle && !vehicleData.locationId) ? (
          <p className="text-sm text-muted-foreground">Please select a location to continue.</p>
        ) : (
          <>
            <VehicleImageUploader
              currentImage={vehicleData.image}
              onImageChange={(image) => setVehicleData(prev => ({ ...prev, image }))}
              disabled={isLoading}
            />
            
            <OcrSection 
              onDataUpdate={updateVehicleData}
              onImageUpdate={(image) => setVehicleData(prev => ({ ...prev, image }))}
              isProcessing={ocrInProgress}
              setIsProcessing={setOcrInProgress}
              disabled={isLoading}
            />
          </>
        )}
        
        <FormActions 
          onCancel={onCancel}
          isLoading={isLoading}
          isProcessing={ocrInProgress}
          submitDisabled={isNewVehicle && !vehicleData.locationId}
        />
      </form>
    </div>
  );
}
