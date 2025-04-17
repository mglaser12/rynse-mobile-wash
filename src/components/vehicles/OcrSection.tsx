
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { OcrImageUploader } from "./OcrImageUploader";
import { VehicleFormData } from "./VehicleFormFields";
import { OCRResult } from "@/utils/ocrUtils";

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
  const handleOcrResult = (result: OCRResult) => {
    if (result.success && result.data) {
      // Map OCR data to vehicle data
      const vehicleData: Partial<VehicleFormData> = {
        make: result.data.make || "",
        model: result.data.model || "",
        year: result.data.year || "",
        color: result.data.color || "",
        licensePlate: result.data.licensePlate || "",
        vinNumber: result.data.vinNumber || "",
      };
      onDataUpdate(vehicleData);
    }
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
        onImageChange={(image) => image && onImageUpdate(image)}
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
