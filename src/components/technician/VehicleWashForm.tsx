
import React, { useState } from "react";
import { Vehicle, VehicleWashStatus } from "@/models/types";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Camera, CheckCircle, Upload } from "lucide-react";
import { VehicleWashPhotoCapture } from "./VehicleWashPhotoCapture";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface VehicleWashFormProps {
  vehicle: Vehicle;
  status: VehicleWashStatus;
  onStatusUpdate: (status: VehicleWashStatus) => void;
}

export const VehicleWashForm = ({ vehicle, status, onStatusUpdate }: VehicleWashFormProps) => {
  const [notes, setNotes] = useState<string>(status.notes || "");
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onStatusUpdate({
      ...status,
      notes: e.target.value
    });
  };
  
  const handlePhotoSaved = (photoDataUrl: string) => {
    onStatusUpdate({
      ...status,
      postWashPhoto: photoDataUrl
    });
    setPhotoDialogOpen(false);
  };
  
  const toggleComplete = () => {
    if (!status.completed && !status.postWashPhoto) {
      // If trying to mark as complete without a photo, show dialog
      return;
    }
    
    onStatusUpdate({
      ...status,
      completed: !status.completed
    });
  };
  
  return (
    <div className="space-y-4">
      <VehicleCard vehicle={vehicle} />
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wash-notes">Notes about this wash:</Label>
            <Textarea 
              id="wash-notes" 
              placeholder="Enter any notes about issues, special attention areas, etc."
              value={notes}
              onChange={handleNotesChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>After-Wash Photo:</Label>
            <div className="flex items-center gap-2">
              {status.postWashPhoto ? (
                <div className="relative">
                  <img 
                    src={status.postWashPhoto} 
                    alt="Washed vehicle" 
                    className="h-40 w-40 object-cover rounded-md border"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute bottom-2 right-2"
                    onClick={() => setPhotoDialogOpen(true)}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Replace
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setPhotoDialogOpen(true)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              )}
              
              <VehicleWashPhotoCapture 
                open={photoDialogOpen}
                onOpenChange={setPhotoDialogOpen}
                onSave={handlePhotoSaved}
              />
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant={status.completed ? "default" : "outline"}
                className={status.completed ? "bg-green-600 hover:bg-green-700" : ""}
                disabled={status.completed}
                onClick={status.postWashPhoto ? toggleComplete : undefined}
              >
                {status.completed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  "Mark as Complete"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Photo Required</AlertDialogTitle>
                <AlertDialogDescription>
                  You must take an after-wash photo of the vehicle before marking it as complete.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => setPhotoDialogOpen(true)}>Take Photo</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
