
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
    setVehicleData
  };
}
