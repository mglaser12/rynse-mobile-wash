import React, { useState, useEffect, useRef } from "react";
import { WashRequest } from "@/models/types";
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
  
  // Fix: Use the correct type for vehicle IDs. If washRequest.vehicles is array of strings,
  // use them directly, or if it's an array of objects, map to get their IDs
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(
    Array.isArray(washRequest.vehicles) && typeof washRequest.vehicles[0] === 'string' 
      ? washRequest.vehicles
      : washRequest.vehicleDetails 
        ? washRequest.vehicleDetails.map(v => v.id) 
        : []
  );
  
  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);
  const formRef = useRef<HTMLDivElement>(null);
  
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

  // Form validation
  const isFormValid = 
    selectedLocationId && 
    selectedVehicleIds.length > 0 && 
    startDate !== undefined;
  
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
    setIsLoading(true);
    
    try {
      const success = await updateWashRequest(washRequest.id, {
        locationId: selectedLocationId,
        vehicleIds: selectedVehicleIds,
        preferredDates: {
          start: startDate,
          end: endDate
        },
        notes
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

  return (
    <div className="space-y-6 overflow-hidden flex flex-col h-full max-h-[80vh]">
      <ScaleIn>
        <div>
          <h2 className="text-lg font-semibold mb-4">Edit Wash Request</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You can modify your wash request details below.
          </p>
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
                  <LocationSelectionSection
                    locations={locations}
                    selectedLocationId={selectedLocationId}
                    onSelectLocation={setSelectedLocationId}
                  />
                </SlideUp>

                <Separator className="my-4" />

                <SlideUp>
                  <VehicleSelectionSection 
                    vehicles={filteredVehicles}
                    selectedVehicleIds={selectedVehicleIds}
                    onSelectVehicle={handleVehicleSelection}
                    onCancel={onCancel}
                    locationSelected={!!selectedLocationId}
                  />
                </SlideUp>

                <Separator className="my-4" />
                
                <SlideUp>
                  <DateSelectionSection 
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                  />
                </SlideUp>
                
                <Separator className="my-4" />
                
                <SlideUp>
                  <NotesSection 
                    notes={notes}
                    onNotesChange={setNotes}
                  />
                </SlideUp>
                
                <Separator className="my-4" />
                
                <SlideUp>
                  <PriceSummary vehicleCount={selectedVehicleIds.length} />
                </SlideUp>
                
                <Separator className="my-4" />
                
                <FadeIn>
                  <FormActions 
                    isLoading={isLoading} 
                    isValid={isFormValid}
                    onCancel={onCancel}
                    submitText="Update Request"
                  />
                </FadeIn>
              </StaggeredChildren>
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
