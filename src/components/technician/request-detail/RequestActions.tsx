
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, X } from "lucide-react";
import { WashRequest } from "@/models/types";
import { DateRangePicker } from "@/components/booking/DateRangePicker";

interface RequestActionsProps {
  washRequest: WashRequest;
  isUpdating: boolean;
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
  onAcceptJob: () => void;
  onStartWash: () => void;
  onCompleteWash: () => void;
  onCancelAcceptance?: () => void;
  userId?: string;
  isMockRequest?: boolean;
}

export const RequestActions = ({
  washRequest,
  isUpdating,
  selectedDate,
  onDateChange,
  onAcceptJob,
  onStartWash,
  onCompleteWash,
  onCancelAcceptance,
  userId,
  isMockRequest = false
}: RequestActionsProps) => {
  const isAssignedTechnician = userId && washRequest.technician === userId;

  if (washRequest.status === "pending") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Wash Date</label>
          <DateRangePicker
            startDate={selectedDate}
            endDate={undefined}
            onStartDateChange={onDateChange}
            onEndDateChange={() => {}}
            allowRange={false}
          />
        </div>
        
        <Button 
          className="w-full" 
          onClick={onAcceptJob}
          disabled={isUpdating || !userId || !selectedDate}
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Accept Job for {selectedDate ? selectedDate.toLocaleDateString() : 'Selected Date'}
            </>
          )}
        </Button>
      </div>
    );
  }

  if (washRequest.status === "confirmed" && isAssignedTechnician) {
    return (
      <div className="space-y-2">
        <Button 
          className="w-full" 
          onClick={onStartWash}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            isMockRequest ? "Demo Mode - Start Wash" : "Start Wash"
          )}
        </Button>
        
        {onCancelAcceptance && (
          <Button 
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" 
            onClick={onCancelAcceptance}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel Acceptance
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  if (washRequest.status === "in_progress" && isAssignedTechnician) {
    return (
      <Button 
        className="w-full" 
        onClick={onCompleteWash}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          isMockRequest ? "Demo Mode - Complete Wash" : "Complete Wash"
        )}
      </Button>
    );
  }

  return null;
};
