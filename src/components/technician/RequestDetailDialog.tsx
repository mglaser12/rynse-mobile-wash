
import React from "react";
import { WashRequest } from "@/models/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: WashRequest | null;
  userId?: string;
  isUpdating: boolean;
  onAcceptRequest: (id: string) => void;
  onStartWash: (id: string) => void;
  onCompleteWash: (id: string) => void;
}

export const RequestDetailDialog = ({
  open,
  onOpenChange,
  selectedRequest,
  userId,
  isUpdating,
  onAcceptRequest,
  onStartWash,
  onCompleteWash
}: RequestDetailDialogProps) => {
  if (!selectedRequest) return null;
  
  // Log information for debugging
  console.log("RequestDetailDialog - Current request status:", selectedRequest.status);
  console.log("RequestDetailDialog - Current technician:", selectedRequest.technician || "undefined");
  console.log("RequestDetailDialog - User ID:", userId);
  
  // Check if this technician is assigned to this request
  const isAssignedTechnician = userId && selectedRequest.technician === userId;
  
  // Check if this is a mock request (for offline demo)
  const isMockRequest = selectedRequest.id.startsWith("mock-");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Only allow closing if not currently updating
      if (!isOpen && !isUpdating) {
        onOpenChange(false);
      } else if (isUpdating) {
        // If trying to close while updating, do nothing
        return;
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Wash Request Details</DialogTitle>
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
          
          {/* Actions based on status */}
          {selectedRequest.status === "pending" && (
            <Button 
              className="w-full" 
              onClick={() => {
                if (userId) {
                  console.log("Accepting job with technician ID:", userId);
                  onAcceptRequest(selectedRequest.id);
                } else {
                  console.error("Cannot accept job - user ID is undefined");
                }
              }}
              disabled={isUpdating || !userId || isMockRequest}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isMockRequest ? "Demo Mode - Accept Job" : "Accept Job"}
            </Button>
          )}
          
          {selectedRequest.status === "confirmed" && isAssignedTechnician && (
            <Button 
              className="w-full" 
              onClick={() => onStartWash(selectedRequest.id)}
              disabled={isUpdating || isMockRequest}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isMockRequest ? "Demo Mode - Start Wash" : "Start Wash"}
            </Button>
          )}
          
          {selectedRequest.status === "in_progress" && isAssignedTechnician && (
            <Button 
              className="w-full" 
              onClick={() => onCompleteWash(selectedRequest.id)}
              disabled={isUpdating || isMockRequest}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isMockRequest ? "Demo Mode - Complete Wash" : "Complete Wash"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
