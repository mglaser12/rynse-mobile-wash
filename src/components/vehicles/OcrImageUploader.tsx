
import React from "react";
import { ScanLine, Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OCRResult } from "@/utils/ocrUtils";

// Update interface to match how it's being used in OcrSection
export interface OcrImageUploaderProps {
  onOcrComplete: (result: OCRResult) => void;
  onOcrError: (error: string) => void;
  onImageChange: (imageDataUrl?: string) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  disabled?: boolean;
  capture?: "user" | "environment";
}

export function OcrImageUploader({
  onOcrComplete,
  onOcrError,
  onImageChange,
  isProcessing,
  setIsProcessing,
  disabled = false,
  capture
}: OcrImageUploaderProps) {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);
    
    try {
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageChange(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Mock OCR processing for now (to be implemented)
      setTimeout(() => {
        const result: OCRResult = {
          success: true,
          data: {
            make: "Sample",
            model: "Car"
          }
        };
        
        onOcrComplete(result);
      }, 1500);
      
    } catch (error) {
      console.error("OCR processing error:", error);
      onOcrError("Error processing image");
    }
  };

  const id = `ocr-image-upload`;

  return (
    <div className="flex-1 min-w-[120px]">
      <label htmlFor={id} className="cursor-pointer">
        <div className="border border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-muted transition-colors">
          {isProcessing ? (
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
          ) : (
            <Camera className="h-8 w-8 mx-auto text-primary" />
          )}
          <span className="text-sm font-medium block mt-2">
            {isProcessing ? "Processing..." : "Scan Document"}
          </span>
        </div>
        <input
          type="file"
          id={id}
          accept="image/*"
          capture={capture}
          className="hidden"
          disabled={disabled || isProcessing}
          onChange={handleImageUpload}
        />
      </label>
    </div>
  );
}
