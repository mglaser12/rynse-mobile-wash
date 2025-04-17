
import React from "react";
import { Vehicle } from "@/models/types";
import { VehicleFormFields } from "./VehicleFormFields";
import { VehicleImageUploader } from "./VehicleImageUploader";
import { OcrSection } from "./OcrSection";
import { FormActions } from "./FormActions";
import { useAddVehicleForm } from "./useAddVehicleForm";

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

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Add New Vehicle</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <VehicleFormFields 
          vehicleData={vehicleData}
          onInputChange={handleInputChange}
          onLocationChange={handleLocationChange}
          disabled={isLoading}
          locationRequired={true}
        />
        
        {vehicleData.locationId && (
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
          submitDisabled={!vehicleData.locationId}
        />
      </form>
    </div>
  );
}
