
import { useState, useEffect } from "react";
import { WashRequest, RecurringFrequency, Vehicle } from "@/models/types";
import { useWashRequests } from "@/contexts/WashContext";
import { VehicleService } from "../ServicesSelectionSection";
import { useFormSteps, FormStep } from "./useFormSteps";
import { supabase } from "@/integrations/supabase/client";

export function useEditWashRequestForm(washRequest: WashRequest, allVehicles: Vehicle[], onSuccess: () => void) {
  const { updateWashRequest } = useWashRequests();
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState(washRequest.notes || "");
  const [startDate, setStartDate] = useState<Date | undefined>(washRequest.preferredDates.start);
  const [endDate, setEndDate] = useState<Date | undefined>(washRequest.preferredDates.end);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>(washRequest.locationId);
  
  // Initialize vehicle IDs from wash request
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(
    Array.isArray(washRequest.vehicles) && typeof washRequest.vehicles[0] === 'string' 
      ? washRequest.vehicles
      : washRequest.vehicleDetails 
        ? washRequest.vehicleDetails.map(v => v.id) 
        : []
  );

  // Initialize vehicle services from wash request
  const [vehicleServices, setVehicleServices] = useState<VehicleService[]>(
    washRequest.vehicleServices 
      ? washRequest.vehicleServices.map(vs => ({
          vehicleId: vs.vehicleId,
          services: vs.services
        }))
      : selectedVehicleIds.map(vehicleId => ({
          vehicleId,
          services: ["exterior-wash"] // Default service
        }))
  );
  
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(allVehicles);
  
  // Extract recurring frequency from the wash request
  const recurringFrequency = washRequest.recurring?.frequency || "none";
  const [selectedFrequency, setSelectedFrequency] = useState<RecurringFrequency>(
    recurringFrequency as RecurringFrequency
  );
  
  // Define form steps with validation conditions
  const formSteps: FormStep[] = [
    { 
      key: "location-vehicles", 
      label: "Location & Vehicles", 
      isValid: !!selectedLocationId && selectedVehicleIds.length > 0 
    },
    { 
      key: "services", 
      label: "Services", 
      isValid: selectedVehicleIds.every(vehicleId => {
        const service = vehicleServices.find(vs => vs.vehicleId === vehicleId);
        return service && service.services.length > 0;
      }) 
    },
    { 
      key: "schedule", 
      label: "Schedule & Notes", 
      isValid: !!startDate 
    }
  ];

  // Use the form steps hook for navigation
  const { 
    currentStep, 
    formRef, 
    handleNext, 
    handlePrevious, 
    isCurrentStepValid 
  } = useFormSteps({ steps: formSteps });

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      setLocations(data || []);
    };
    
    fetchLocations();
  }, []);
  
  // Load vehicles for the selected location
  useEffect(() => {
    if (selectedLocationId) {
      const fetchVehicleLocations = async () => {
        const { data } = await supabase
          .from('location_vehicles')
          .select('vehicle_id')
          .eq('location_id', selectedLocationId);
        
        if (data && data.length > 0) {
          const vehicleIds = data.map(item => item.vehicle_id);
          setFilteredVehicles(allVehicles.filter(v => vehicleIds.includes(v.id)));
        } else {
          setFilteredVehicles([]);
        }
      };
      
      fetchVehicleLocations();
    } else {
      setFilteredVehicles([]);
    }
  }, [selectedLocationId, allVehicles]);

  // Initialize vehicle services when vehicles are selected
  useEffect(() => {
    selectedVehicleIds.forEach(vehicleId => {
      if (!vehicleServices.some(vs => vs.vehicleId === vehicleId)) {
        // Add default services for newly selected vehicles
        setVehicleServices(prev => [
          ...prev, 
          { vehicleId, services: ["exterior-wash"] }
        ]);
      }
    });
    
    // Remove services for deselected vehicles
    setVehicleServices(prev => prev.filter(vs => selectedVehicleIds.includes(vs.vehicleId)));
  }, [selectedVehicleIds]);

  // Handle vehicle selection
  const handleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await updateWashRequest(washRequest.id, {
        locationId: selectedLocationId,
        vehicleIds: selectedVehicleIds,
        preferredDates: {
          start: startDate,
          end: endDate
        },
        notes,
        recurringFrequency: selectedFrequency === "none" ? undefined : selectedFrequency,
        vehicleServices: vehicleServices
      });
      
      if (success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating wash request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    locations,
    filteredVehicles,
    selectedLocationId,
    selectedVehicleIds,
    vehicleServices,
    startDate,
    endDate,
    notes,
    selectedFrequency,
    isLoading,
    formRef,
    currentStep,
    handleNext,
    handlePrevious,
    isCurrentStepValid,
    steps: formSteps,
    setSelectedLocationId,
    handleVehicleSelection,
    setVehicleServices,
    setStartDate,
    setEndDate,
    setSelectedFrequency,
    setNotes,
    handleSubmit
  };
}
