
import React, { useState, useEffect } from "react";
import { WashRequest } from "@/models/types";
import { useWashRequests } from "@/contexts/WashContext";
import { DateRangePicker } from "@/components/booking/DateRangePicker";
import { NotesSection } from "@/components/booking/NotesSection";
import { toast } from "sonner";
import { FormActions } from "@/components/booking/FormActions";

interface EditWashRequestFormProps {
  washRequest: WashRequest;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditWashRequestForm({ washRequest, onSuccess, onCancel }: EditWashRequestFormProps) {
  const { updateWashRequest } = useWashRequests();
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState(washRequest.notes || "");
  const [startDate, setStartDate] = useState<Date | undefined>(washRequest.preferredDates.start);
  const [endDate, setEndDate] = useState<Date | undefined>(washRequest.preferredDates.end);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await updateWashRequest(washRequest.id, {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Edit Wash Request</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You can modify the preferred date and notes for your wash request.
        </p>
      </div>
      
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      
      <NotesSection 
        notes={notes} 
        onNotesChange={setNotes} 
      />
      
      <FormActions 
        isLoading={isLoading} 
        isValid={true} 
        onCancel={onCancel}
        submitText="Update Request" 
      />
    </form>
  );
}
