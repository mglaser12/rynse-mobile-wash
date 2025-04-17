
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { OCRResult } from "@/utils/ocrUtils";

export interface OcrImageUploaderProps {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      onProcessingStateChange(true);

      // Get image as data URL for preview
      const reader = new FileReader();
      let imageDataUrl: string | undefined;
      
      reader.onload = async (event) => {
        if (event.target?.result) {
          imageDataUrl = event.target.result as string;
          
          // Process the image with OCR
          const result = await processingFunction(file);
          
          // Send the result and optionally the image data URL
          onImageProcessed(result, imageDataUrl);
          
          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      onImageProcessed({
        success: false,
        error: "Failed to process image"
      });
    } finally {
      onProcessingStateChange(false);
    }
  };

  return (
    <div className="flex-1 text-center">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isProcessing}
        capture={capture}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-24 flex flex-col items-center justify-center"
        onClick={handleClick}
        disabled={disabled || isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          icon
        )}
        <span className="text-sm">{isProcessing ? "Processing..." : label}</span>
      </Button>
    </div>
  );
}
