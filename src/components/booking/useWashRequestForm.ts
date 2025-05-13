
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWashRequests } from "@/contexts/WashContext";
import { toast } from "sonner";
import { useLocations } from "@/contexts/LocationContext";
import { RecurringFrequency } from "@/models/types";
import { VehicleService } from "./ServicesSelectionSection";

export function useWashRequestForm(onSuccess?: () => void) {
  const { user } = useAuth();
  const { createWashRequest } = useWashRequests();
  const { locations } = useLocations();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>(undefined);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>("none");

  const handleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent, vehicleServices?: VehicleService[]) => {
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

    if (!selectedLocationId) {
      toast.error("Please select a location for your wash");
      return;
    }

    // Validate that all selected vehicles have at least one service
    if (vehicleServices) {
      const missingServiceVehicles = selectedVehicleIds.filter(vehicleId => {
        const service = vehicleServices.find(vs => vs.vehicleId === vehicleId);
        return !service || service.services.length === 0;
      });

      if (missingServiceVehicles.length > 0) {
        toast.error("Please select at least one service for each vehicle");
        return;
      }
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
        locationId: selectedLocationId,
        recurringFrequency: recurringFrequency === "none" ? undefined : recurringFrequency,
        vehicleServices: vehicleServices || [],
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating wash request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = selectedVehicleIds.length > 0 && startDate !== undefined && selectedLocationId !== undefined;

  return {
    isLoading,
    selectedVehicleIds,
    startDate,
    endDate,
    notes,
    selectedLocationId,
    locations,
    recurringFrequency,
    isFormValid,
    setNotes,
    setStartDate,
    setEndDate,
    setSelectedLocationId,
    setRecurringFrequency,
    handleVehicleSelection,
    handleSubmit
  };
}
