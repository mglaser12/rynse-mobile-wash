
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/models/types";
import { useVehicles } from "@/contexts/VehicleContext";
import { Loader2, Check, X, Image, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EditVehicleFormProps {
  vehicle: Vehicle;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function EditVehicleForm({ vehicle, onCancel, onSuccess }: EditVehicleFormProps) {
  const { updateVehicle, removeVehicle } = useVehicles();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [vehicleData, setVehicleData] = useState<Partial<Vehicle>>({
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    licensePlate: vehicle.licensePlate,
    type: vehicle.type,
    color: vehicle.color,
    vinNumber: vehicle.vinNumber,
    image: vehicle.image,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!vehicleData.make || !vehicleData.model || !vehicleData.year) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    try {
      await updateVehicle(vehicle.id, vehicleData);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating vehicle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await removeVehicle(vehicle.id);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Error removing vehicle:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleImageClick = () => {
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
          setVehicleData((prev) => ({ ...prev, image: base64Image }));
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
    setVehicleData((prev) => ({ ...prev, image: undefined }));
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Edit Vehicle</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="make">Make*</Label>
            <Input
              id="make"
              name="make"
              value={vehicleData.make}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Toyota"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model">Model*</Label>
            <Input
              id="model"
              name="model"
              value={vehicleData.model}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Camry"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year">Year*</Label>
            <Input
              id="year"
              name="year"
              value={vehicleData.year}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="2023"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              name="color"
              value={vehicleData.color}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Blue"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              name="type"
              value={vehicleData.type}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Sedan, SUV, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="licensePlate">License Plate</Label>
            <Input
              id="licensePlate"
              name="licensePlate"
              value={vehicleData.licensePlate}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="ABC123"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <Label>Vehicle Image</Label>
          {imageLoading ? (
            <div className="mt-2 rounded-md overflow-hidden h-40 bg-muted flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vehicleData.image ? (
            <div className="mt-2 relative group">
              <div className="rounded-md overflow-hidden h-40 flex items-center justify-center bg-muted">
                <img 
                  src={vehicleData.image} 
                  alt={`${vehicleData.make} ${vehicleData.model}`} 
                  className="max-h-full max-w-full object-cover"
                />
              </div>
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
            </div>
          ) : (
            <div 
              onClick={handleImageClick}
              className="mt-2 rounded-md border-2 border-dashed border-gray-300 h-40 flex flex-col items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
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
            className="hidden"
          />
        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Delete Vehicle
              </>
            )}
          </Button>
          
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isDeleting}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
