
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
              onClick={() => onAcceptRequest(selectedRequest.id)}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
