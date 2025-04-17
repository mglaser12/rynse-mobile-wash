
import React from "react";
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
    setVehicleData
  } = useAddVehicleForm({ onSuccess });

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Add New Vehicle</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <VehicleFormFields 
          vehicleData={vehicleData}
          onInputChange={handleInputChange}
          disabled={isLoading}
        />
        
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
        
        <FormActions 
          onCancel={onCancel}
          isLoading={isLoading}
          isProcessing={ocrInProgress}
        />
      </form>
    </div>
  );
}
