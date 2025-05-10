
import React, { useState } from "react";
import { DateSelectionSection } from "./DateSelectionSection";
import { LocationSelectionSection } from "./LocationSelectionSection";
import { NotesSection } from "./NotesSection";
import { FormActions } from "./FormActions";
import { useWashRequests } from "@/contexts/WashContext";
import { WashRequest } from "@/models/types";
import { toast } from "sonner";
import { useLocations } from "@/contexts/LocationContext";

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
  const { updateWashRequest } = useWashRequests();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form state with existing wash request data
  const [startDate, setStartDate] = useState<Date>(washRequest.preferredDates.start);
  const [endDate, setEndDate] = useState<Date | undefined>(washRequest.preferredDates.end);
  const [locationId, setLocationId] = useState<string>(washRequest.locationId || "");
  const [notes, setNotes] = useState<string>(washRequest.notes || "");

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
        toast.success("Wash request updated successfully");
        onSuccess();
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
        <DateSelectionSection 
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <LocationSelectionSection 
          locations={locations}
          selectedLocationId={locationId}
          onSelectLocation={setLocationId}
        />

        <NotesSection 
          notes={notes}
          onNotesChange={setNotes}
        />
      </div>

      <FormActions 
        primaryLabel="Update Wash Request"
        secondaryLabel="Cancel"
        isSubmitting={isSubmitting}
        isValid={!!startDate && !!locationId}
        onCancel={onCancel}
      />
    </form>
  );
}
