
import React from "react";
import { ScanLine, Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OCRResult } from "@/utils/ocrUtils";

interface OcrImageUploaderProps {
  onImageProcessed: (result: OCRResult, imageDataUrl?: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
  processingFunction: (file: File) => Promise<OCRResult>;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  isProcessing?: boolean;
  capture?: "user" | "environment";
}

export function OcrImageUploader({
  onImageProcessed,
  onProcessingStateChange,
  processingFunction,
  icon,
  label,
  disabled = false,
  isProcessing = false,
  capture
}: OcrImageUploaderProps) {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    onProcessingStateChange(true);
    
    try {
      // Process the image using provided function
      toast.info(`Processing ${label} image...`);
      const result = await processingFunction(file);
      
      if (result.success) {
        // Create a preview of the image
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onImageProcessed(result, e.target?.result as string);
          } else {
            onImageProcessed(result);
          }
        };
        reader.readAsDataURL(file);
        
        toast.success(`${label} processed successfully!`);
      } else {
        onImageProcessed(result);
        toast.error(result.error || `Could not extract ${label} information`);
      }
    } catch (error) {
      console.error(`${label} processing error:`, error);
      toast.error(`Error processing ${label} image`);
    } finally {
      onProcessingStateChange(false);
    }
  };

  const id = `${label.toLowerCase().replace(/\s/g, '')}-upload`;

  return (
    <div className="flex-1 min-w-[120px]">
      <label htmlFor={id} className="cursor-pointer">
        <div className="border border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-muted transition-colors">
          {icon}
          <span className="text-sm font-medium">{label}</span>
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
