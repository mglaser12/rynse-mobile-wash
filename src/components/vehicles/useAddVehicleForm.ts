
import { useState, useCallback, ChangeEvent, FormEvent } from "react";
import { useVehicles } from "@/contexts/VehicleContext";
import { toast } from "sonner";
import { VehicleFormData } from "./VehicleFormFields";

interface UseAddVehicleFormProps {
  onSuccess?: () => void;
}

export function useAddVehicleForm({ onSuccess }: UseAddVehicleFormProps) {
  const { addVehicle } = useVehicles();
  
  // State for vehicle data
  const [vehicleData, setVehicleData] = useState<VehicleFormData>({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    vinNumber: "",
    type: "",
    image: ""
  });
  
  // Loading and processing states
  const [isLoading, setIsLoading] = useState(false);
  const [ocrInProgress, setOcrInProgress] = useState(false);
  
  // Handle input changes
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  // Update vehicle data (used by OCR)
  const updateVehicleData = useCallback((data: Partial<VehicleFormData>) => {
    setVehicleData(prev => ({ ...prev, ...data }));
  }, []);
  
  // Form submission handler
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.color) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await addVehicle({
        ...vehicleData,
        year: vehicleData.year
      });
      
      toast.success("Vehicle added successfully");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle");
    } finally {
      setIsLoading(false);
    }
  }, [vehicleData, addVehicle, onSuccess]);
  
  return {
    vehicleData,
    setVehicleData,
    isLoading,
    ocrInProgress,
    setOcrInProgress,
    handleInputChange,
    handleSubmit,
    updateVehicleData
  };
}
