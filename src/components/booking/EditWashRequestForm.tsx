
import React, { useState, useEffect } from "react";
import { DateSelectionSection } from "./DateSelectionSection";
import { LocationSelectionSection } from "./LocationSelectionSection";
import { NotesSection } from "./NotesSection";
import { FormActions } from "./FormActions";
import { useWashRequests } from "@/contexts/WashContext";
import { WashRequest, Vehicle } from "@/models/types";
import { toast } from "sonner";
import { useLocations } from "@/contexts/LocationContext";
import { VehicleSelectionSection } from "./VehicleSelectionSection";
import { useVehicles } from "@/contexts/VehicleContext";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

interface EditWashRequestFormProps {
  washRequest: WashRequest;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditWashRequestForm({ 
  washRequest, 
  onSuccess,
  onCancel 
}: EditWashRequestFormProps) {
  const { locations } = useLocations();
  const { vehicles } = useVehicles();
  const { updateWashRequest } = useWashRequests();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form state with existing wash request data
  const [startDate, setStartDate] = useState<Date>(washRequest.preferredDates.start);
  const [endDate, setEndDate] = useState<Date | undefined>(washRequest.preferredDates.end);
  const [locationId, setLocationId] = useState<string>(washRequest.locationId || "");
  const [notes, setNotes] = useState<string>(washRequest.notes || "");
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(washRequest.vehicles || []);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);

  // Load vehicles for the selected location
  useEffect(() => {
    if (locationId) {
      const fetchVehicleLocations = async () => {
        const { data } = await supabase
          .from('location_vehicles')
          .select('vehicle_id')
          .eq('location_id', locationId);
        
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
  }, [locationId, vehicles]);

  // Handle vehicle selection/deselection
  const handleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  // Update wash request vehicle associations
  const updateVehicleAssociations = async (washRequestId: string, vehicleIds: string[]) => {
    // First, delete all existing associations
    const { error: deleteError } = await supabase
      .from('wash_request_vehicles')
      .delete()
      .eq('wash_request_id', washRequestId);
    
    if (deleteError) {
      console.error("Error deleting vehicle associations:", deleteError);
      return false;
    }
    
    // Then create new associations
    if (vehicleIds.length === 0) {
      return true; // No vehicles to add
    }
    
    const vehicleInserts = vehicleIds.map(vehicleId => ({
      wash_request_id: washRequestId,
      vehicle_id: vehicleId
    }));
    
    const { error } = await supabase
      .from('wash_request_vehicles')
      .insert(vehicleInserts);
    
    if (error) {
      console.error("Error creating vehicle associations:", error);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate) {
      toast.error("Please select a date");
      return;
    }

    if (!locationId) {
      toast.error("Please select a location");
      return;
    }
    
    if (selectedVehicleIds.length === 0) {
      toast.error("Please select at least one vehicle");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the wash request with the edited data
      const success = await updateWashRequest(washRequest.id, {
        preferredDates: {
          start: startDate,
          end: endDate
        },
        locationId,
        notes
      });

      if (success) {
        // Update vehicle associations
        const vehiclesUpdated = await updateVehicleAssociations(washRequest.id, selectedVehicleIds);
        
        if (vehiclesUpdated) {
          toast.success("Wash request updated successfully");
          onSuccess();
        } else {
          toast.error("Failed to update vehicles");
        }
      } else {
        toast.error("Failed to update wash request");
      }
    } catch (error) {
      console.error("Error updating wash request:", error);
      toast.error("Failed to update wash request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto flex-grow">
      <h2 className="text-xl font-semibold">Edit Wash Request</h2>

      <div className="space-y-6">
        <LocationSelectionSection 
          locations={locations}
          selectedLocationId={locationId}
          onSelectLocation={setLocationId}
        />
        
        <Separator />

        <VehicleSelectionSection 
          vehicles={filteredVehicles}
          selectedVehicleIds={selectedVehicleIds}
          onSelectVehicle={handleVehicleSelection}
          onCancel={onCancel}
          locationSelected={!!locationId}
        />
        
        <Separator />
        
        <DateSelectionSection 
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <Separator />

        <NotesSection 
          notes={notes}
          onNotesChange={setNotes}
        />
      </div>

      <FormActions 
        primaryLabel="Update Wash Request"
        secondaryLabel="Cancel"
        isSubmitting={isSubmitting}
        isValid={!!startDate && !!locationId && selectedVehicleIds.length > 0}
        onCancel={onCancel}
        onSecondaryAction={onCancel}
      />
    </form>
  );
}
