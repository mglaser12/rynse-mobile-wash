
import React from "react";
import { ScanLine, Camera, Upload, Loader2 } from "lucide-react";
import { 
  processVinImage, 
  processLicensePlateImage, 
  detectVehicleFromImage,
  OCRResult
} from "@/utils/ocrUtils";
import { OcrImageUploader } from "./OcrImageUploader";
import { VehicleFormData } from "./VehicleFormFields";

interface OcrSectionProps {
  onDataUpdate: (newData: Partial<VehicleFormData>) => void;
  onImageUpdate: (image?: string) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  disabled?: boolean;
}

export function OcrSection({
  onDataUpdate,
  onImageUpdate,
  isProcessing,
  setIsProcessing,
  disabled = false
}: OcrSectionProps) {
  const handleVinResult = (result: OCRResult, imageDataUrl?: string) => {
    if (result.success && result.data) {
      onDataUpdate({
        make: result.data.make || '',
        model: result.data.model || '',
        year: result.data.year || '',
        vinNumber: result.data.vinNumber || '',
        type: result.data.type || '',
      });
      
      if (imageDataUrl) {
        onImageUpdate(imageDataUrl);
      }
    }
  };

  const handleLicensePlateResult = (result: OCRResult, imageDataUrl?: string) => {
    if (result.success && result.data) {
      onDataUpdate({
        licensePlate: result.data.licensePlate || '',
      });
      
      if (imageDataUrl) {
        onImageUpdate(imageDataUrl);
      }
    }
  };

  const handleVehiclePhotoResult = (result: OCRResult, imageDataUrl?: string) => {
    if (result.success && result.data) {
      onDataUpdate({
        type: result.data.type || '',
        make: result.data.make || '',
        model: result.data.model || '',
        year: result.data.year || '',
      });
      
      if (imageDataUrl) {
        onImageUpdate(imageDataUrl);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Use OCR to Auto-Fill</label>
      
      <div className="flex flex-wrap gap-2">
        <OcrImageUploader
          onImageProcessed={handleVinResult}
          onProcessingStateChange={setIsProcessing}
          processingFunction={processVinImage}
          icon={<ScanLine className="h-5 w-5 mx-auto mb-2" />}
          label="Scan VIN"
          disabled={disabled}
          isProcessing={isProcessing}
          capture="environment"
        />
        
        <OcrImageUploader
          onImageProcessed={handleLicensePlateResult}
          onProcessingStateChange={setIsProcessing}
          processingFunction={processLicensePlateImage}
          icon={<Camera className="h-5 w-5 mx-auto mb-2" />}
          label="Scan License"
          disabled={disabled}
          isProcessing={isProcessing}
          capture="environment"
        />
        
        <OcrImageUploader
          onImageProcessed={handleVehiclePhotoResult}
          onProcessingStateChange={setIsProcessing}
          processingFunction={detectVehicleFromImage}
          icon={<Upload className="h-5 w-5 mx-auto mb-2" />}
          label="Vehicle Photo"
          disabled={disabled}
          isProcessing={isProcessing}
        />
      </div>
      
      {isProcessing && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Processing image...</span>
        </div>
      )}
    </div>
  );
}
