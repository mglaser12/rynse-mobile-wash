
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OcrImageUploader } from "./OcrImageUploader";
import { Camera, ScanLine } from "lucide-react";
import { OCRResult, processImageWithOCR } from "@/utils/ocrUtils";
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
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-medium mb-2">Scan Vehicle Information</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Take a photo of your vehicle registration or VIN plate to automatically fill in details
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
            processingFunction={processImageWithOCR}
            icon={<Camera className="h-8 w-8 text-muted-foreground mx-auto mb-1" />}
            label="Camera"
            disabled={disabled}
            isProcessing={isProcessing}
            capture="environment"
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
            processingFunction={processImageWithOCR}
            icon={<ScanLine className="h-8 w-8 text-muted-foreground mx-auto mb-1" />}
            label="Upload Document"
            disabled={disabled}
            isProcessing={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
}
