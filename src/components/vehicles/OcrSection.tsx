import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { OcrImageUploader } from "./OcrImageUploader";
import { VehicleFormData } from "./VehicleFormFields";

interface OcrSectionProps {
  onDataUpdate: (data: Partial<VehicleFormData>) => void;
  onImageUpdate: (image: string) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  disabled?: boolean;
}

export function OcrSection({
  onDataUpdate,
  onImageUpdate,
  isProcessing,
  setIsProcessing,
  disabled = false
}: OcrSectionProps) {
  const handleOcrResult = (data: any) => {
    // Map OCR data to vehicle data
    const vehicleData: Partial<VehicleFormData> = {
      make: data.make || "",
      model: data.model || "",
      year: data.year || "",
      color: data.color || "",
      licensePlate: data.licensePlate || "",
      vinNumber: data.vinNumber || "",
    };
    onDataUpdate(vehicleData);
    setIsProcessing(false);
  };

  const handleOcrError = (error: string) => {
    console.error("OCR Error:", error);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">
        Scan Registration or License Plate
      </h4>
      <OcrImageUploader
        onOcrComplete={handleOcrResult}
        onOcrError={handleOcrError}
        onImageChange={onImageUpdate}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">
        Upload an image of your vehicle registration or license plate to automatically fill in details
      </p>
    </div>
  );
}
