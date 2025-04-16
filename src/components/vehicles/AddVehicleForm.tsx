
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/models/types";
import { useVehicles } from "@/contexts/VehicleContext";
import { 
  processVinImage, 
  processLicensePlateImage, 
  detectVehicleFromImage,
  cleanupOCRWorker
} from "@/utils/ocrUtils";
import { Loader2, Upload, Camera, Check, X, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { VehicleFormFields } from "./VehicleFormFields";
import { VehicleImageUploader } from "./VehicleImageUploader";

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

  // Clean up OCR worker when component unmounts
  useEffect(() => {
    return () => {
      cleanupOCRWorker();
    };
  }, []);

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
          } else {
            toast.error(result.error || "Could not extract VIN information");
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
          } else {
            toast.error(result.error || "Could not extract license plate");
          }
          break;
          
        case 'vehicle':
          toast.info("Detecting vehicle type...");
          result = await detectVehicleFromImage(file);
          if (result.success && result.data) {
            setVehicleData((prev) => ({
              ...prev,
              type: result.data?.type || prev.type,
              make: result.data?.make || prev.make, 
              model: result.data?.model || prev.model,
              year: result.data?.year || prev.year,
            }));
            toast.success("Vehicle information detected!");
          } else {
            toast.error(result.error || "Could not detect vehicle information");
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
        <VehicleFormFields 
          vehicleData={vehicleData}
          onInputChange={handleInputChange}
          disabled={isLoading}
        />
        
        <VehicleImageUploader
          currentImage={vehicleData.image}
          onImageChange={(image) => setVehicleData(prev => ({ ...prev, image }))}
          disabled={isLoading}
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Use OCR to Auto-Fill</label>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="vinUpload" className="cursor-pointer">
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-muted transition-colors">
                  <ScanLine className="h-5 w-5 mx-auto mb-2" />
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
