import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from "lucide-react";

interface VehicleImageUploaderProps {
  currentImage?: string;
  onImageChange: (image: string) => void;
  disabled?: boolean;
}

export function VehicleImageUploader({ 
  currentImage, 
  onImageChange, 
  disabled = false
}: VehicleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0];
      
      // Convert file to data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(imageFile);
    }
  };
  
  const handleRemoveImage = () => {
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Vehicle Image</h4>
      {currentImage ? (
        <div className="relative">
          <img 
            src={currentImage} 
            alt="Vehicle" 
            className="rounded-md w-full h-40 object-cover" 
          />
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 shadow-md"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            disabled={disabled}
          />
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleUploadClick}
            disabled={disabled}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Upload an image of your vehicle
      </p>
    </div>
  );
}
