
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditWashRequestForm } from "@/components/booking/EditWashRequestForm";
import { WashRequest } from "@/models/types";

interface EditWashRequestDialogProps {
  washRequest: WashRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWashRequestDialog({ 
  washRequest, 
  open, 
  onOpenChange 
}: EditWashRequestDialogProps) {
  if (!washRequest) return null;
  
  const handleSuccess = () => {
    onOpenChange(false);
  };
  
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg py-6 max-h-[90vh] overflow-hidden flex flex-col">
        <EditWashRequestForm 
          washRequest={washRequest}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
