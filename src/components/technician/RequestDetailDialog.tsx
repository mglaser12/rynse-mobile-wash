
import React from "react";
import { WashRequest } from "@/models/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

  console.log("RequestDetailDialog - Current request status:", selectedRequest.status);
  console.log("RequestDetailDialog - Current technician:", selectedRequest.technician);
  console.log("RequestDetailDialog - User ID:", userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Wash Request Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <WashRequestCard washRequest={selectedRequest} />
          
          {/* Actions based on status */}
          {selectedRequest.status === "pending" && (
            <Button 
              className="w-full" 
              onClick={() => {
                console.log("Accept button clicked for request:", selectedRequest.id);
                if (userId) {
                  console.log("Accepting job with technician ID:", userId);
                }
                onAcceptRequest(selectedRequest.id);
              }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Accept Job
            </Button>
          )}
          
          {selectedRequest.status === "confirmed" && selectedRequest.technician === userId && (
            <Button 
              className="w-full" 
              onClick={() => onStartWash(selectedRequest.id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Start Wash
            </Button>
          )}
          
          {selectedRequest.status === "in_progress" && selectedRequest.technician === userId && (
            <Button 
              className="w-full" 
              onClick={() => onCompleteWash(selectedRequest.id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Complete Wash
            </Button>
          )}

          {/* Debug info */}
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Status: {selectedRequest.status}</p>
            <p>Technician: {selectedRequest.technician || 'None'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
