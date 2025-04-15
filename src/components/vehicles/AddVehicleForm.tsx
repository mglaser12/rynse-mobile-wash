import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/models/types";
import { useVehicles } from "@/contexts/VehicleContext";
import { 
  processVinImage, 
  processLicensePlateImage, 
  detectVehicleFromImage 
} from "@/utils/ocrUtils";
import { Loader2, Upload, Camera, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AddVehicleFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export function AddVehicleForm({ onCancel, onSuccess }: AddVehicleFormProps) {
  const { user } = useAuth();
  const { addVehicle } = useVehicles();
  const [isLoading, setIsLoading] = useState(false);
  const [ocrInProgress, setOcrInProgress] = useState(false);
  const [vehicleData, setVehicleData] = useState<Omit<Vehicle, "id" | "dateAdded" | "customerId">>({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    type: "",
    color: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to add a vehicle");
      return;
    }

    // Validate required fields - only Make, Model, and Year
    if (!vehicleData.make || !vehicleData.model || !vehicleData.year) {
      toast.error("Please fill in all required fields: Make, Model, and Year");
      return;
    }
    
    setIsLoading(true);
    try {
      await addVehicle({
        ...vehicleData,
        customerId: user.id,
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding vehicle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'vin' | 'license' | 'vehicle') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setOcrInProgress(true);
    
    try {
      let result;
      
      switch (type) {
        case 'vin':
          toast.info("Processing VIN image...");
          result = await processVinImage(file);
          if (result.success && result.data) {
            setVehicleData((prev) => ({
              ...prev,
              make: result.data?.make || prev.make,
              model: result.data?.model || prev.model,
              year: result.data?.year || prev.year,
              vinNumber: result.data?.vinNumber || prev.vinNumber,
              type: result.data?.type || prev.type,
            }));
            toast.success("VIN processed successfully!");
          }
          break;
          
        case 'license':
          toast.info("Processing license plate image...");
          result = await processLicensePlateImage(file);
          if (result.success && result.data) {
            setVehicleData((prev) => ({
              ...prev,
              licensePlate: result.data?.licensePlate || prev.licensePlate,
            }));
            toast.success("License plate processed successfully!");
          }
          break;
          
        case 'vehicle':
          toast.info("Detecting vehicle type...");
          result = await detectVehicleFromImage(file);
          if (result.success && result.data) {
            setVehicleData((prev) => ({
              ...prev,
              type: result.data?.type || prev.type,
            }));
            toast.success("Vehicle type detected!");
          }
          break;
      }
      
      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setVehicleData(prev => ({ ...prev, image: e.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error("OCR processing error:", error);
      toast.error("Error processing image");
    } finally {
      setOcrInProgress(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Add New Vehicle</h3>
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
        
        <div className="space-y-2">
          <Label>Use OCR to Auto-Fill</Label>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="vinUpload" className="cursor-pointer">
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-muted transition-colors">
                  <Upload className="h-5 w-5 mx-auto mb-2" />
                  <span className="text-sm font-medium">Scan VIN</span>
                </div>
                <input
                  type="file"
                  id="vinUpload"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={ocrInProgress || isLoading}
                  onChange={(e) => handleImageUpload(e, 'vin')}
                />
              </label>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="licensePlateUpload" className="cursor-pointer">
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-muted transition-colors">
                  <Camera className="h-5 w-5 mx-auto mb-2" />
                  <span className="text-sm font-medium">Scan License</span>
                </div>
                <input
                  type="file"
                  id="licensePlateUpload"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={ocrInProgress || isLoading}
                  onChange={(e) => handleImageUpload(e, 'license')}
                />
              </label>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="vehicleUpload" className="cursor-pointer">
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-muted transition-colors">
                  <Upload className="h-5 w-5 mx-auto mb-2" />
                  <span className="text-sm font-medium">Vehicle Photo</span>
                </div>
                <input
                  type="file"
                  id="vehicleUpload"
                  accept="image/*"
                  className="hidden"
                  disabled={ocrInProgress || isLoading}
                  onChange={(e) => handleImageUpload(e, 'vehicle')}
                />
              </label>
            </div>
          </div>
          
          {ocrInProgress && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Processing image...</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || ocrInProgress}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Vehicle
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
