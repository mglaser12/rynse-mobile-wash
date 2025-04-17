
import React, { useState } from "react";
import { WashRequest } from "@/models/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Calendar, MapPin, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { JobScheduler } from "./JobScheduler";
import { Card } from "@/components/ui/card";

interface RequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: WashRequest | null;
  userId?: string;
  isUpdating: boolean;
  onAcceptRequest: (id: string) => void;
  onStartWash: (id: string) => void;
  onCompleteWash: (id: string) => void;
  onCancelAcceptance?: (id: string) => void; // Add new prop for canceling acceptance
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
  onCancelAcceptance, // Use the new prop
  onScheduleJob,
  readOnly = false
}: RequestDetailDialogProps) => {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  if (!selectedRequest) return null;
  
  // Check if this technician is assigned to this request
  const isAssignedTechnician = userId && selectedRequest.technician === userId;
  
  // Check if this is a mock request (for offline demo)
  const isMockRequest = selectedRequest.id.startsWith("mock-");
  
  // Check if this is a fleet manager created job
  const isFleetManagerJob = selectedRequest.customerId !== userId;

  const handleAcceptJob = () => {
    if (userId) {
      if (onScheduleJob) {
        // Open the scheduler instead of accepting directly
        setIsSchedulerOpen(true);
      } else {
        // Fall back to direct acceptance
        onAcceptRequest(selectedRequest.id);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        // Only allow closing if not currently updating
        if (!isOpen && !isUpdating) {
          onOpenChange(false);
          setIsSchedulerOpen(false);
        } else if (isUpdating) {
          // If trying to close while updating, do nothing
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
            {isMockRequest && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This is demo data shown due to connection issues. Actions may not be saved.
                </AlertDescription>
              </Alert>
            )}
            
            <WashRequestCard washRequest={selectedRequest} />
            
            {/* Display location/address information if available */}
            {selectedRequest.location && selectedRequest.location.address && (
              <Card className="p-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{selectedRequest.location.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedRequest.location.address}</p>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Only show action buttons if not in readOnly mode */}
            {!readOnly && (
              <>
                {/* Actions based on status */}
                {selectedRequest.status === "pending" && (
                  <Button 
                    className="w-full" 
                    onClick={handleAcceptJob}
                    disabled={isUpdating || !userId}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {onScheduleJob ? (
                          <>
                            <Calendar className="h-4 w-4 mr-2" />
                            Accept & Schedule Job
                          </>
                        ) : (
                          isMockRequest ? "Demo Mode - Accept Job" : "Accept Job"
                        )}
                      </>
                    )}
                  </Button>
                )}
                
                {selectedRequest.status === "confirmed" && isAssignedTechnician && (
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => onStartWash(selectedRequest.id)}
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
                    
                    {/* Add Cancel Acceptance button for confirmed jobs */}
                    {onCancelAcceptance && (
                      <Button 
                        variant="outline" 
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" 
                        onClick={() => onCancelAcceptance(selectedRequest.id)}
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
                )}
                
                {selectedRequest.status === "in_progress" && isAssignedTechnician && (
                  <Button 
                    className="w-full" 
                    onClick={() => onCompleteWash(selectedRequest.id)}
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
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Scheduler Dialog */}
      {selectedRequest && onScheduleJob && !readOnly && (
        <JobScheduler
          washRequest={selectedRequest}
          open={isSchedulerOpen}
          onOpenChange={setIsSchedulerOpen}
          onScheduleJob={onScheduleJob}
          isUpdating={isUpdating}
        />
      )}
    </>
  );
};
