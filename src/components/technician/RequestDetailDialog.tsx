
import React, { useState } from "react";
import { WashRequest } from "@/models/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { LocationCard } from "./request-detail/LocationCard";
import { RequestActions } from "./request-detail/RequestActions";
import { MockRequestAlert } from "./request-detail/MockRequestAlert";

interface RequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: WashRequest | null;
  userId?: string;
  isUpdating: boolean;
  onAcceptRequest: (id: string) => void;
  onStartWash: (id: string) => void;
  onCompleteWash: (id: string) => void;
  onCancelAcceptance?: (id: string) => void;
  onScheduleJob?: (requestId: string, scheduledDate: Date) => Promise<boolean>;
  readOnly?: boolean;
}

export const RequestDetailDialog = ({
  open,
  onOpenChange,
  selectedRequest,
  userId,
  isUpdating,
  onAcceptRequest,
  onStartWash,
  onCompleteWash,
  onCancelAcceptance,
  onScheduleJob,
  readOnly = false
}: RequestDetailDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  if (!selectedRequest) return null;
  
  const isMockRequest = selectedRequest.id.startsWith("mock-");

  const handleAcceptJob = () => {
    if (userId) {
      if (selectedDate) {
        if (onScheduleJob) {
          onScheduleJob(selectedRequest.id, selectedDate);
        } else {
          onAcceptRequest(selectedRequest.id);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !isUpdating) {
        onOpenChange(false);
        setSelectedDate(undefined);
      } else if (isUpdating) {
        return;
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? "Job Details" : "Wash Request Details"}
          </DialogTitle>
          {isMockRequest && (
            <DialogDescription className="text-amber-500">
              This is demo data shown for offline use
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          {isMockRequest && <MockRequestAlert />}
          
          <WashRequestCard washRequest={selectedRequest} />
          
          {selectedRequest.location && (
            <LocationCard location={selectedRequest.location} />
          )}
          
          {!readOnly && (
            <RequestActions
              washRequest={selectedRequest}
              isUpdating={isUpdating}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onAcceptJob={handleAcceptJob}
              onStartWash={() => onStartWash(selectedRequest.id)}
              onCompleteWash={() => onCompleteWash(selectedRequest.id)}
              onCancelAcceptance={onCancelAcceptance ? 
                () => onCancelAcceptance(selectedRequest.id) : 
                undefined}
              userId={userId}
              isMockRequest={isMockRequest}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
