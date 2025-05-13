
import React, { useRef, useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useVehicles } from "@/contexts/VehicleContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VehicleSelectionSection } from "./VehicleSelectionSection";
import { DateSelectionSection } from "./DateSelectionSection";
import { NotesSection } from "./NotesSection";
import { PriceSummary } from "./PriceSummary";
import { FormActions } from "./FormActions";
import { useWashRequestForm } from "./useWashRequestForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { LocationSelectionSection } from "./LocationSelectionSection";
import { supabase } from "@/integrations/supabase/client";
import { RecurringSelectionSection } from "./RecurringSelectionSection";
import { ServicesSelectionSection, VehicleService } from "./ServicesSelectionSection";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface CreateWashRequestFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export function CreateWashRequestForm({ onSuccess, onCancel }: CreateWashRequestFormProps) {
  const { vehicles } = useVehicles();
  const isMobile = useIsMobile();
  const formRef = useRef<HTMLDivElement>(null);
  
  // Form step state
  const [currentStep, setCurrentStep] = useState(0);
  
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
    isFormValid,
    setNotes,
    setStartDate,
    setEndDate,
    setSelectedLocationId,
    setRecurringFrequency,
    handleVehicleSelection,
    handleSubmit
  } = useWashRequestForm(onSuccess);

  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);

  // Step validation
  const isStep1Valid = selectedLocationId && selectedVehicleIds.length > 0;
  const isStep2Valid = selectedVehicleIds.every(vehicleId => {
    const service = vehicleServices.find(vs => vs.vehicleId === vehicleId);
    return service && service.services.length > 0;
  });
  const isStep3Valid = startDate !== undefined;

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

  // Handle next step
  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      // Scroll to top of form when changing steps
      if (formRef.current) {
        formRef.current.scrollTop = 0;
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll to top of form when changing steps
      if (formRef.current) {
        formRef.current.scrollTop = 0;
      }
    }
  };

  // Modified submit handler to include services
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call the original submit handler with additional service data
    handleSubmit(e, vehicleServices);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="form-section">
              <LocationSelectionSection
                locations={locations}
                selectedLocationId={selectedLocationId}
                onSelectLocation={setSelectedLocationId}
              />
            </div>

            <Separator className="my-4" />

            <div className="form-section">
              <VehicleSelectionSection 
                vehicles={filteredVehicles}
                selectedVehicleIds={selectedVehicleIds}
                onSelectVehicle={handleVehicleSelection}
                onCancel={onCancel}
                locationSelected={!!selectedLocationId}
              />
            </div>
          </>
        );
      case 1:
        return (
          <div className="form-section">
            <ServicesSelectionSection
              vehicles={filteredVehicles}
              selectedVehicleIds={selectedVehicleIds}
              vehicleServices={vehicleServices}
              onServiceChange={setVehicleServices}
            />
          </div>
        );
      case 2:
        return (
          <>
            <div className="form-section">
              <DateSelectionSection 
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
              
            <Separator className="my-4" />
              
            <div className="form-section">
              <RecurringSelectionSection
                selectedFrequency={recurringFrequency}
                onSelectFrequency={setRecurringFrequency}
              />
            </div>
              
            <Separator className="my-4" />
              
            <div className="form-section">
              <NotesSection 
                notes={notes}
                onNotesChange={setNotes}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Step navigation buttons
  const renderStepNav = () => {
    return (
      <div className="flex justify-between items-center mt-4">
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
        )}
        
        {currentStep < 2 && (
          <Button
            type="button"
            onClick={handleNext}
            disabled={currentStep === 0 ? !isStep1Valid : !isStep2Valid}
            className="ml-auto flex items-center"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    );
  };

  // Step indicator
  const renderStepIndicator = () => {
    const steps = ["Location & Vehicles", "Services", "Schedule & Notes"];
    
    return (
      <div className="flex items-center space-x-2 mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {index > 0 && <div className="h-0.5 w-8 bg-muted-foreground/30" />}
            <div 
              className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium 
                ${index === currentStep ? 'bg-primary text-primary-foreground' : 
                 index < currentStep ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
            >
              {index + 1}
            </div>
            <div className="text-sm font-medium">
              {step}
            </div>
            {index < steps.length - 1 && <div className="h-0.5 w-8 bg-muted-foreground/30" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 overflow-hidden flex flex-col h-full max-h-[80vh]">
      <div>
        <h3 className="text-lg font-medium">Request a Mobile Wash Quote</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Complete the form to get a quote for your mobile wash.
        </p>
        {renderStepIndicator()}
      </div>
      
      <ScrollArea 
        className="flex-1 pr-4 -mr-4 overflow-y-auto" 
        scrollHideDelay={0}
      >
        <div ref={formRef} className="pb-4">
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-6">
              {renderStepContent()}
              
              {renderStepNav()}
              
              {currentStep === 2 && (
                <>
                  <Separator className="my-4" />
                  
                  <div className="form-section">
                    <PriceSummary 
                      vehicleCount={selectedVehicleIds.length} 
                      recurringFrequency={recurringFrequency}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <FormActions 
                    isLoading={isLoading} 
                    isValid={isStep3Valid}
                    onCancel={onCancel}
                  />
                </>
              )}
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
