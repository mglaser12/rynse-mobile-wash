
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Loader2, Edit2 } from "lucide-react";
import { useWashRequests } from "@/contexts/WashContext";

interface WashRequestActionsProps {
  requestId: string;
  status: string;
  onEdit: () => void;
}

export function WashRequestActions({ requestId, status, onEdit }: WashRequestActionsProps) {
  const { cancelWashRequest } = useWashRequests();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const handleCancelRequest = async () => {
    setShowCancelConfirm(false);
    setCancellingId(requestId);
    try {
      await cancelWashRequest(requestId);
    } finally {
      setCancellingId(null);
    }
  };

  // Only show actions for pending or confirmed status
  if (!["pending", "confirmed"].includes(status)) {
    return null;
  }
  
  return (
    <div className="flex gap-2 mt-4">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1" 
        onClick={onEdit}
      >
        <Edit2 className="h-4 w-4 mr-2" />
        Edit
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowCancelConfirm(true)}
        disabled={cancellingId === requestId}
        className="flex-1"
      >
        {cancellingId === requestId ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        Cancel
      </Button>
      
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Wash Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this wash request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelRequest}>
              Yes, cancel it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
