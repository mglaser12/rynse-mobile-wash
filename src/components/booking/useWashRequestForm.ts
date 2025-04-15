
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWashRequests } from "@/contexts/WashContext";
import { toast } from "sonner";

export function useWashRequestForm(onSuccess?: () => void) {
  const { user } = useAuth();
  const { createWashRequest } = useWashRequests();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const handleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create a wash request");
      return;
    }

    if (selectedVehicleIds.length === 0) {
      toast.error("Please select at least one vehicle");
      return;
    }

    if (!startDate) {
      toast.error("Please select a date for your wash");
      return;
    }

    setIsLoading(true);

    try {
      await createWashRequest({
        customerId: user.id,
        vehicles: selectedVehicleIds,
        preferredDates: {
          start: startDate,
          end: endDate,
        },
        price: selectedVehicleIds.length * 39.99,
        notes: notes,
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating wash request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = selectedVehicleIds.length > 0 && startDate !== undefined;

  return {
    isLoading,
    selectedVehicleIds,
    startDate,
    endDate,
    notes,
    isFormValid,
    setNotes,
    setStartDate,
    setEndDate,
    handleVehicleSelection,
    handleSubmit
  };
}
