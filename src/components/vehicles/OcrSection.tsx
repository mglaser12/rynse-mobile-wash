
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OcrImageUploader } from "./OcrImageUploader";
import { Camera, Search } from "lucide-react";
import { OCRResult } from "@/utils/ocrUtils";
import { VehicleFormData } from "./VehicleFormFields";
import { enhancedVehicleRecognition } from "@/utils/vehicleRecognition";

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
  const handleOcrComplete = (result: OCRResult) => {
    if (result.success && result.data) {
      // Update form with OCR data
      onDataUpdate({
        make: result.data.make,
        model: result.data.model,
        year: result.data.year,
        vinNumber: result.data.vinNumber,
        licensePlate: result.data.licensePlate,
        type: result.data.type,
        assetNumber: result.data.assetNumber,
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-medium mb-2">Scan Vehicle Information</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Take a photo of your vehicle or documentation to automatically fill in details
        </p>
        <div className="flex gap-4 justify-between">
          <OcrImageUploader
            onImageProcessed={(result, imageDataUrl) => {
              handleOcrComplete(result);
              if (imageDataUrl) {
                onImageUpdate(imageDataUrl);
              }
            }}
            onProcessingStateChange={setIsProcessing}
            processingFunction={enhancedVehicleRecognition}
            icon={<Camera className="h-8 w-8 text-muted-foreground mx-auto mb-1" />}
            label="Camera"
            disabled={disabled}
            isProcessing={isProcessing}
            capture="environment"
            helpText="Point camera at vehicle or registration"
          />
          <Separator orientation="vertical" />
          <OcrImageUploader
            onImageProcessed={(result, imageDataUrl) => {
              handleOcrComplete(result);
              if (imageDataUrl) {
                onImageUpdate(imageDataUrl);
              }
            }}
            onProcessingStateChange={setIsProcessing}
            processingFunction={enhancedVehicleRecognition}
            icon={<Search className="h-8 w-8 text-muted-foreground mx-auto mb-1" />}
            label="Upload Image"
            disabled={disabled}
            isProcessing={isProcessing}
            helpText="Upload vehicle image or documentation"
          />
        </div>
      </CardContent>
    </Card>
  );
}
