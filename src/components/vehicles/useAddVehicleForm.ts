
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useVehicles } from "@/contexts/VehicleContext";
import { Vehicle } from "@/models/types";
import { toast } from "sonner";
import { cleanupOCRWorker } from "@/utils/ocrUtils";
import { VehicleFormData } from "./VehicleFormFields";

interface UseAddVehicleFormProps {
  onSuccess?: () => void;
}

export function useAddVehicleForm({ onSuccess }: UseAddVehicleFormProps) {
  const { user } = useAuth();
  const { addVehicle } = useVehicles();
  const [isLoading, setIsLoading] = useState(false);
  const [ocrInProgress, setOcrInProgress] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleFormData & { image?: string }>({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    type: "",
    color: "",
    locationId: "",
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

  const handleLocationChange = (locationId: string) => {
    setVehicleData(prev => ({ ...prev, locationId }));
  };

  const updateVehicleData = (newData: Partial<VehicleFormData>) => {
    setVehicleData(prev => ({
      ...prev,
      ...Object.entries(newData).reduce((acc, [key, value]) => {
        // Only update if the value is not empty and the field is currently empty
        // or if the value is more specific than what's already there
        if (value && (!prev[key as keyof VehicleFormData] || value.length > prev[key as keyof VehicleFormData]?.length)) {
          return { ...acc, [key]: value };
        }
        return acc;
      }, {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to add a vehicle");
      return;
    }

    // Validate required fields - Make, Model, Year, and LocationId
    if (!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.locationId) {
      toast.error("Please fill in all required fields: Location, Make, Model, and Year");
      return;
    }
    
    setIsLoading(true);
    try {
      // Extract locationId for separate handling
      const { locationId, ...vehicleFormData } = vehicleData;
      
      // Add vehicle using the core vehicle data - pass locationId as a separate parameter
      await addVehicle({
        ...vehicleFormData,
        customerId: user.id,
        // Ensure these properties exist with at least empty strings
        color: vehicleFormData.color || "",
        type: vehicleFormData.type || "",
        licensePlate: vehicleFormData.licensePlate || "",
        organizationId: user.organizationId,
      }, locationId);  // Pass locationId as a separate parameter
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to save vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vehicleData,
    isLoading,
    ocrInProgress,
    setOcrInProgress,
    handleInputChange,
    handleSubmit,
    updateVehicleData,
    setVehicleData,
    handleLocationChange
  };
}
