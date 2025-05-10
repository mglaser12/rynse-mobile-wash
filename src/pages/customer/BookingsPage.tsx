
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { CreateWashRequestForm } from "@/components/booking/CreateWashRequestForm";
import { useWashRequests } from "@/contexts/WashContext";
import { Dialog } from "@/components/ui/dialog";
import { PwaDialogContent } from "@/components/ui/pwa-dialog"; // Use PWA-optimized dialog
import { DialogTitle } from "@/components/ui/dialog"; // Import DialogTitle for accessibility
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { CompletedWashDetailDialog } from "@/components/technician/CompletedWashDetailDialog";
import { WashRequest } from "@/models/types";

const BookingsPage = () => {
  console.log("BookingsPage rendered - testing AI edits");
  
  const { washRequests, isLoading } = useWashRequests();
  const [showNewBookingDialog, setShowNewBookingDialog] = useState(false);
  const [dialogClosing, setDialogClosing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedWashRequest, setSelectedWashRequest] = useState<WashRequest | null>(null);

  useEffect(() => {
    console.log("BookingsPage - Wash Requests:", washRequests.length);
  }, [washRequests]);

  const activeRequests = washRequests.filter(req => 
    ["pending", "confirmed", "in_progress"].includes(req.status)
  );
  
  const completedRequests = washRequests.filter(req => req.status === "completed");
  const cancelledRequests = washRequests.filter(req => req.status === "cancelled");

  // Handle dialog state changes with animation frame to prevent blocking
  const handleOpenDialogChange = (open: boolean) => {
    if (!open && !dialogClosing) {
      setDialogClosing(true);
      
      // Use requestAnimationFrame to defer state update until after animations
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowNewBookingDialog(false);
          setDialogClosing(false);
        });
      });
    } else if (open) {
      setShowNewBookingDialog(true);
    }
  };

  const handleViewCompletedWash = (washRequest: WashRequest) => {
    setSelectedWashRequest(washRequest);
  };

  return (
    <AppLayout>
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/3d6deccc-d4a2-4bfb-9acc-18c6e46f5b73.png" 
              alt="Rynse Logo" 
              className="h-8 mr-3" 
            />
            <div>
              <h1 className="text-xl font-bold">Your Bookings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your wash appointments
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialogChange(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Schedule a Wash
          </Button>
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="pt-4 space-y-4">
              {activeRequests.length > 0 ? (
                activeRequests.map(request => (
                  <WashRequestCard 
                    key={request.id} 
                    washRequest={request}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active bookings</p>
                  <Button onClick={() => handleOpenDialogChange(true)}>
                    Schedule a Wash
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="pt-4 space-y-4">
              {completedRequests.length > 0 ? (
                completedRequests.map(request => (
                  <WashRequestCard 
                    key={request.id} 
                    washRequest={request}
                    onClick={() => handleViewCompletedWash(request)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No completed bookings</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cancelled" className="pt-4 space-y-4">
              {cancelledRequests.length > 0 ? (
                cancelledRequests.map(request => (
                  <WashRequestCard 
                    key={request.id} 
                    washRequest={request}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No cancelled bookings</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        <Alert className="mt-6">
          <AlertDescription>
            Need additional help? Contact our support team for assistance.
          </AlertDescription>
        </Alert>
      </div>
      
      <Dialog open={showNewBookingDialog} onOpenChange={handleOpenDialogChange}>
        <PwaDialogContent className="w-full max-w-lg py-6 max-h-[90vh] overflow-hidden flex flex-col">
          {showNewBookingDialog && (
            <>
              <DialogTitle className="text-xl font-semibold mb-4">Schedule a Wash</DialogTitle>
              <CreateWashRequestForm 
                onSuccess={() => handleOpenDialogChange(false)}
                onCancel={() => handleOpenDialogChange(false)}
              />
            </>
          )}
        </PwaDialogContent>
      </Dialog>

      <CompletedWashDetailDialog
        open={!!selectedWashRequest}
        onOpenChange={(open) => !open && setSelectedWashRequest(null)}
        washRequest={selectedWashRequest}
      />
    </AppLayout>
  );
};

export default BookingsPage;
