
import React, { useState, useCallback } from "react";
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
  // Always declare hooks at the top level
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Use callbacks for handlers
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen && !isUpdating) {
      setSelectedDate(undefined);
      onOpenChange(false);
    } else if (!isUpdating) {
      onOpenChange(true);
    }
  }, [isUpdating, onOpenChange]);

  const handleAcceptJob = useCallback(() => {
    if (!selectedRequest || !userId) return;
    
    if (selectedDate) {
      if (onScheduleJob) {
        onScheduleJob(selectedRequest.id, selectedDate)
          .catch(error => console.error('Failed to schedule job:', error));
      } else {
        onAcceptRequest(selectedRequest.id);
      }
    }
  }, [selectedRequest, userId, selectedDate, onScheduleJob, onAcceptRequest]);

  // Return empty fragment instead of null for consistency
  if (!selectedRequest) {
    return <></>;
  }
  
  const isMockRequest = selectedRequest.id.startsWith("mock-");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? "Job Details" : "Wash Request Details"}
          </DialogTitle>
          <DialogDescription>
            {isMockRequest 
              ? "This is demo data shown for offline use" 
              : "Review the details for this wash request"}
          </DialogDescription>
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