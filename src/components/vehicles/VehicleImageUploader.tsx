
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Image, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface VehicleImageUploaderProps {
  currentImage?: string;
  onImageChange: (image: string | undefined) => void;
  disabled?: boolean;
}

export function VehicleImageUploader({
  currentImage,
  onImageChange,
  disabled = false
}: VehicleImageUploaderProps) {
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageLoading(true);
    
    try {
      // Read the file as base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const base64Image = event.target.result as string;
          onImageChange(base64Image);
        }
        setImageLoading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      setImageLoading(false);
    }
  };

  const handleRemoveImage = () => {
    // Explicitly set image to undefined to remove it
    onImageChange(undefined);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Add toast confirmation
    toast.success('Image removed');
  };

  return (
    <div className="mt-4">
      {imageLoading ? (
        <div className="mt-2 rounded-md overflow-hidden h-40 bg-muted flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : currentImage ? (
        <div className="mt-2 relative group">
          <div className="rounded-md overflow-hidden h-40 flex items-center justify-center bg-muted">
            <img 
              src={currentImage} 
              alt="Vehicle" 
              className="max-h-full max-w-full object-cover"
            />
          </div>
          {!disabled && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                type="button" 
                variant="secondary" 
                size="sm"
                onClick={handleImageClick}
              >
                <Upload className="h-4 w-4 mr-1" />
                Change
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={handleRemoveImage}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div 
          onClick={handleImageClick}
          className={`mt-2 rounded-md border-2 border-dashed border-gray-300 h-40 flex flex-col items-center justify-center bg-muted/50 ${!disabled ? 'cursor-pointer hover:bg-muted transition-colors' : ''}`}
        >
          <Image className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Click to upload an image</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WebP (max 5MB)</p>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}
