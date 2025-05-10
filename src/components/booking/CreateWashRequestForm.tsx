
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

interface CreateWashRequestFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export function CreateWashRequestForm({ onSuccess, onCancel }: CreateWashRequestFormProps) {
  const { vehicles } = useVehicles();
  const isMobile = useIsMobile();
  const formRef = useRef<HTMLDivElement>(null);
  
  const { 
    isLoading,
    selectedVehicleIds,
    startDate,
    endDate,
    notes,
    selectedLocationId,
    locations,
    isFormValid,
    setNotes,
    setStartDate,
    setEndDate,
    setSelectedLocationId,
    handleVehicleSelection,
    handleSubmit
  } = useWashRequestForm(onSuccess);

  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);

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

  return (
    <div className="space-y-6 overflow-hidden flex flex-col h-full max-h-[80vh]">
      <div>
        <h3 className="text-lg font-medium">Request a Mobile Wash</h3>
        <p className="text-sm text-muted-foreground">
          Select a location, vehicles and preferred details for your mobile wash.
        </p>
      </div>
      
      <ScrollArea 
        className="flex-1 pr-4 -mr-4 overflow-y-auto" 
        scrollHideDelay={0}
      >
        <div ref={formRef} className="pb-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="form-section">
                <LocationSelectionSection
                  locations={locations}
                  selectedLocationId={selectedLocationId}
                  onSelectLocation={setSelectedLocationId}
                />
              </div>

              <Separator />

              <div className="form-section">
                <VehicleSelectionSection 
                  vehicles={filteredVehicles}
                  selectedVehicleIds={selectedVehicleIds}
                  onSelectVehicle={handleVehicleSelection}
                  onCancel={onCancel}
                  locationSelected={!!selectedLocationId}
                />
              </div>

              <Separator />
              
              <div className="form-section">
                <DateSelectionSection 
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>
              
              <Separator />
              
              <div className="form-section">
                <NotesSection 
                  notes={notes}
                  onNotesChange={setNotes}
                />
              </div>
              
              <Separator />
              
              <div className="form-section">
                <PriceSummary vehicleCount={selectedVehicleIds.length} />
              </div>
              
              <Separator />
              
              <FormActions 
                isLoading={isLoading}
                isValid={isFormValid}
                onCancel={onCancel}
              />
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
