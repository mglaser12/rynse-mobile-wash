
import React, { useState, useEffect, useRef } from "react";
import { WashRequest, RecurringFrequency } from "@/models/types";
import { useWashRequests } from "@/contexts/WashContext";
import { DateSelectionSection } from "@/components/booking/DateSelectionSection";
import { NotesSection } from "@/components/booking/NotesSection";
import { toast } from "sonner";
import { FormActions } from "@/components/booking/FormActions";
import { LocationSelectionSection } from "./LocationSelectionSection";
import { VehicleSelectionSection } from "./VehicleSelectionSection";
import { PriceSummary } from "./PriceSummary";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVehicles } from "@/contexts/VehicleContext";
import { supabase } from "@/integrations/supabase/client";
import { FadeIn, ScaleIn, SlideUp, StaggeredChildren } from "@/components/ui/micro-animations";
import { ServicesSelectionSection, VehicleService } from "./ServicesSelectionSection";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { RecurringSelectionSection } from "./RecurringSelectionSection";

interface EditWashRequestFormProps {
  washRequest: WashRequest;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditWashRequestForm({ washRequest, onSuccess, onCancel }: EditWashRequestFormProps) {
  const { updateWashRequest } = useWashRequests();
  const { vehicles } = useVehicles();
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState(washRequest.notes || "");
  const [startDate, setStartDate] = useState<Date | undefined>(washRequest.preferredDates.start);
  const [endDate, setEndDate] = useState<Date | undefined>(washRequest.preferredDates.end);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>(washRequest.locationId);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Fix: Use the correct type for vehicle IDs. If washRequest.vehicles is array of strings,
  // use them directly, or if it's an array of objects, map to get their IDs
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(
    Array.isArray(washRequest.vehicles) && typeof washRequest.vehicles[0] === 'string' 
      ? washRequest.vehicles
      : washRequest.vehicleDetails 
        ? washRequest.vehicleDetails.map(v => v.id) 
        : []
  );

  // Initialize vehicle services from wash request if available
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
  
  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Extract recurring frequency from the wash request if it exists
  const recurringFrequency = washRequest.recurring?.frequency || "none";
  const [selectedFrequency, setSelectedFrequency] = useState<RecurringFrequency>(
    recurringFrequency as RecurringFrequency
  );
  
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

  // Step validation
  const isStep1Valid = selectedLocationId && selectedVehicleIds.length > 0;
  const isStep2Valid = selectedVehicleIds.every(vehicleId => {
    const service = vehicleServices.find(vs => vs.vehicleId === vehicleId);
    return service && service.services.length > 0;
  });
  const isStep3Valid = startDate !== undefined;
  
  const handleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

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
        toast.success("Wash request updated successfully");
        onSuccess();
      } else {
        toast.error("Failed to update wash request");
      }
    } catch (error) {
      console.error("Error updating wash request:", error);
      toast.error("An error occurred while updating your request");
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <LocationSelectionSection
              locations={locations}
              selectedLocationId={selectedLocationId}
              onSelectLocation={setSelectedLocationId}
            />

            <Separator className="my-4" />

            <VehicleSelectionSection 
              vehicles={filteredVehicles}
              selectedVehicleIds={selectedVehicleIds}
              onSelectVehicle={handleVehicleSelection}
              onCancel={onCancel}
              locationSelected={!!selectedLocationId}
            />
          </>
        );
      case 1:
        return (
          <ServicesSelectionSection
            vehicles={filteredVehicles}
            selectedVehicleIds={selectedVehicleIds}
            vehicleServices={vehicleServices}
            onServiceChange={setVehicleServices}
          />
        );
      case 2:
        return (
          <>
            <DateSelectionSection 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            
            <Separator className="my-4" />
            
            <RecurringSelectionSection
              selectedFrequency={selectedFrequency}
              onSelectFrequency={setSelectedFrequency}
            />
            
            <Separator className="my-4" />
            
            <NotesSection 
              notes={notes}
              onNotesChange={setNotes}
            />
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
      <ScaleIn>
        <div>
          <h2 className="text-lg font-semibold mb-4">Edit Wash Request</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You can modify your wash request details below.
          </p>
          {renderStepIndicator()}
        </div>
      </ScaleIn>
      
      <ScrollArea 
        className="flex-1 pr-4 -mr-4 overflow-y-auto" 
        scrollHideDelay={0}
      >
        <div ref={formRef} className="pb-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <StaggeredChildren staggerMs={150}>
                <SlideUp>
                  {renderStepContent()}
                </SlideUp>
                
                {renderStepNav()}
                
                {currentStep === 2 && (
                  <>
                    <Separator className="my-4" />
                    
                    <SlideUp>
                      <PriceSummary 
                        vehicleCount={selectedVehicleIds.length} 
                        recurringFrequency={selectedFrequency}
                      />
                    </SlideUp>
                    
                    <Separator className="my-4" />
                    
                    <FadeIn>
                      <FormActions 
                        isLoading={isLoading} 
                        isValid={isStep3Valid}
                        onCancel={onCancel}
                        submitText="Update Quote"
                      />
                    </FadeIn>
                  </>
                )}
              </StaggeredChildren>
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
