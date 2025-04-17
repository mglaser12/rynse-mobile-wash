import React, { useState } from "react";
import { WashRequest } from "@/models/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Calendar, MapPin, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateRangePicker } from "@/components/booking/DateRangePicker";
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
  
  const isAssignedTechnician = userId && selectedRequest.technician === userId;
  
  const isMockRequest = selectedRequest.id.startsWith("mock-");
  
  const isFleetManagerJob = selectedRequest.customerId !== userId;

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
    <>
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
            {isMockRequest && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This is demo data shown due to connection issues. Actions may not be saved.
                </AlertDescription>
              </Alert>
            )}
            
            <WashRequestCard washRequest={selectedRequest} />
            
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
            
            {!readOnly && (
              <>
                {selectedRequest.status === "pending" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Wash Date</label>
                      <DateRangePicker
                        startDate={selectedDate}
                        endDate={undefined}
                        onStartDateChange={setSelectedDate}
                        onEndDateChange={() => {}}
                        allowRange={false}
                      />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleAcceptJob}
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
    </>
  );
};
