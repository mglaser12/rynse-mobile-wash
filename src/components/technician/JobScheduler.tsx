
import React, { useState } from "react";
import { WashRequest } from "@/models/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DateSelectionSection } from "@/components/booking/DateSelectionSection";
import { Loader2 } from "lucide-react";

interface JobSchedulerProps {
  washRequest: WashRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleJob: (requestId: string, scheduledDate: Date) => Promise<boolean>;
  isUpdating: boolean;
}

export const JobScheduler = ({
  washRequest,
  open,
  onOpenChange,
  onScheduleJob,
  isUpdating,
}: JobSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    washRequest?.preferredDates.start
  );
  
  // Reset the selected date when the request changes
  React.useEffect(() => {
    if (washRequest) {
      setSelectedDate(washRequest.preferredDates.start);
    }
  }, [washRequest]);

  const handleScheduleJob = async () => {
    if (!washRequest || !selectedDate) return;
    
    const result = await onScheduleJob(washRequest.id, selectedDate);
    
    if (result) {
      onOpenChange(false);
    }
  };

  // Format the preferred date range as a string
  const formatPreferredDateRange = () => {
    if (!washRequest) return "";
    
    const { start, end } = washRequest.preferredDates;
    if (!end) {
      return `${format(start, "MMM dd, yyyy")}`;
    }
    
    return `${format(start, "MMM dd, yyyy")} - ${format(end, "MMM dd, yyyy")}`;
  };

  if (!washRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Job</DialogTitle>
          <DialogDescription>
            Select a date within the customer's preferred range: {formatPreferredDateRange()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <DateSelectionSection
            startDate={selectedDate}
            endDate={undefined}
            onStartDateChange={setSelectedDate}
            onEndDateChange={() => {}}
            allowRange={false}
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleScheduleJob}
            disabled={!selectedDate || isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Job"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
