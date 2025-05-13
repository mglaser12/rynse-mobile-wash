
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVehicles } from "@/contexts/VehicleContext";
import { useWashRequestForm } from "./useWashRequestForm";
import { VehicleService } from "./ServicesSelectionSection";
import { supabase } from "@/integrations/supabase/client";
import { StepIndicator } from "./steps/StepIndicator";
import { StepNavigation } from "./steps/StepNavigation";
import { LocationVehicleStep } from "./steps/LocationVehicleStep";
import { ServicesStep } from "./steps/ServicesStep";
import { ScheduleStep } from "./steps/ScheduleStep";
import { useFormSteps, FormStep } from "./hooks/useFormSteps";

interface CreateWashRequestFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export function CreateWashRequestForm({ onSuccess, onCancel }: CreateWashRequestFormProps) {
  const { vehicles } = useVehicles();
  
  // Service selection state
  const [vehicleServices, setVehicleServices] = useState<VehicleService[]>([]);
  
  const { 
    isLoading,
    selectedVehicleIds,
    startDate,
    endDate,
    notes,
    selectedLocationId,
    locations,
    recurringFrequency,
    setNotes,
    setStartDate,
    setEndDate,
    setSelectedLocationId,
    setRecurringFrequency,
    handleVehicleSelection,
    handleSubmit
  } = useWashRequestForm(onSuccess);

  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);

  // Step validation functions
  const isStep1Valid = selectedLocationId && selectedVehicleIds.length > 0;
  const isStep2Valid = selectedVehicleIds.every(vehicleId => {
    const service = vehicleServices.find(vs => vs.vehicleId === vehicleId);
    return service && service.services.length > 0;
  });
  const isStep3Valid = startDate !== undefined;

  // Define form steps
  const steps: FormStep[] = [
    { key: "location-vehicles", label: "Location & Vehicles", isValid: isStep1Valid },
    { key: "services", label: "Services", isValid: isStep2Valid },
    { key: "schedule", label: "Schedule & Notes", isValid: isStep3Valid }
  ];

  const {
    currentStep,
    formRef,
    handleNext,
    handlePrevious,
    isCurrentStepValid,
    totalSteps
  } = useFormSteps({ steps });

  // Find default location and set it as selected on initial load
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      const defaultLocation = locations.find(loc => loc.isDefault);
      if (defaultLocation) {
        setSelectedLocationId(defaultLocation.id);
      } else {
        // If no default, select first location
        setSelectedLocationId(locations[0].id);
      }
    }
  }, [locations, selectedLocationId, setSelectedLocationId]);

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
          setFilteredVehicles(vehicles.filter(v => vehicleIds.includes(v.id)));
        } else {
          setFilteredVehicles([]);
        }
      };
      
      fetchVehicleLocations();
    } else {
      setFilteredVehicles([]);
    }
  }, [selectedLocationId, vehicles]);

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

  // Modified submit handler to include services
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call the original submit handler with additional service data
    handleSubmit(e, vehicleServices);
  };

  // Render current step content
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <LocationVehicleStep
            locations={locations}
            vehicles={filteredVehicles}
            selectedLocationId={selectedLocationId}
            selectedVehicleIds={selectedVehicleIds}
            onSelectLocation={setSelectedLocationId}
            onSelectVehicle={handleVehicleSelection}
            onCancel={onCancel}
          />
        );
      case 1:
        return (
          <ServicesStep
            vehicles={filteredVehicles}
            selectedVehicleIds={selectedVehicleIds}
            vehicleServices={vehicleServices}
            onServiceChange={setVehicleServices}
          />
        );
      case 2:
        return (
          <ScheduleStep
            startDate={startDate}
            endDate={endDate}
            notes={notes}
            recurringFrequency={recurringFrequency}
            isLoading={isLoading}
            selectedVehicleIds={selectedVehicleIds}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onRecurringFrequencyChange={setRecurringFrequency}
            onNotesChange={setNotes}
            onCancel={onCancel}
            isStepValid={isStep3Valid}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 overflow-hidden flex flex-col h-full max-h-[80vh]">
      <div>
        <h3 className="text-lg font-medium">Request a Mobile Wash Quote</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Complete the form to get a quote for your mobile wash.
        </p>
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>
      
      <ScrollArea 
        className="flex-1 pr-4 -mr-4 overflow-y-auto" 
        scrollHideDelay={0}
      >
        <div ref={formRef} className="pb-4">
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-6">
              {renderCurrentStep()}
              
              {currentStep < 2 && (
                <StepNavigation 
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isNextDisabled={!isCurrentStepValid()}
                />
              )}
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
