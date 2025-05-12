
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { OCRResult } from "@/utils/ocrUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface OcrImageUploaderProps {
  onImageProcessed: (result: OCRResult, imageDataUrl?: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
  processingFunction: (file: File) => Promise<OCRResult>;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  isProcessing?: boolean;
  capture?: "user" | "environment";
  helpText?: string; // Added help text prop for additional user guidance
}

export function OcrImageUploader({
  onImageProcessed,
  onProcessingStateChange,
  processingFunction,
  icon,
  label,
  disabled = false,
  isProcessing = false,
  capture,
  helpText
}: OcrImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");

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
      setProcessingStatus("Preparing image...");

      // Get image as data URL for preview
      const reader = new FileReader();
      let imageDataUrl: string | undefined;
      
      reader.onload = async (event) => {
        if (event.target?.result) {
          imageDataUrl = event.target.result as string;
          
          // Update status
          setProcessingStatus("Analyzing image...");
          
          // Process the image with enhanced recognition
          const result = await processingFunction(file);
          
          // Update status based on result
          setProcessingStatus(result.success ? "Processing complete" : "Processing failed");
          
          // Send the result and optionally the image data URL
          onImageProcessed(result, imageDataUrl);
          
          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          // Clear status after a delay
          setTimeout(() => {
            setProcessingStatus("");
          }, 2000);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      setProcessingStatus("Error processing image");
      onImageProcessed({
        success: false,
        error: "Failed to process image"
      });
      
      // Clear status after a delay
      setTimeout(() => {
        setProcessingStatus("");
      }, 2000);
    } finally {
      onProcessingStateChange(false);
    }
  };

  const buttonContent = isProcessing ? (
    <>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="text-sm">{processingStatus || "Processing..."}</span>
    </>
  ) : (
    <>
      {icon}
      <span className="text-sm">{label}</span>
      {helpText && <span className="text-xs text-muted-foreground mt-1">{helpText}</span>}
    </>
  );

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center"
              onClick={handleClick}
              disabled={disabled || isProcessing}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          {helpText && (
            <TooltipContent>
              <p>{helpText}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
