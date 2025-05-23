
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { CreateWashRequestForm } from "@/components/booking/CreateWashRequestForm";
import { useWashRequests } from "@/contexts/WashContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { CompletedWashDetailDialog } from "@/components/technician/CompletedWashDetailDialog";
import { WashRequest } from "@/models/types";
import { WashRequestActions } from "@/components/wash/WashRequestActions";
import { EditWashRequestDialog } from "@/components/wash/EditWashRequestDialog";

const BookingsPage = () => {
  console.log("BookingsPage rendered - testing AI edits");
  
  const { washRequests, isLoading } = useWashRequests();
  const [showNewBookingDialog, setShowNewBookingDialog] = useState(false);
  const [selectedWashRequest, setSelectedWashRequest] = useState<WashRequest | null>(null);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    console.log("BookingsPage - Wash Requests:", washRequests.length);
  }, [washRequests]);

  // Sort wash requests by createdAt date (most recent first)
  const sortedWashRequests = [...washRequests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const activeRequests = sortedWashRequests.filter(req => 
    ["pending", "confirmed", "in_progress"].includes(req.status)
  );
  
  const completedRequests = sortedWashRequests.filter(req => req.status === "completed");
  const cancelledRequests = sortedWashRequests.filter(req => req.status === "cancelled");

  const handleViewCompletedWash = (washRequest: WashRequest) => {
    setSelectedWashRequest(washRequest);
    setShowCompletedDialog(true);
  };

  const handleEditWashRequest = (washRequest: WashRequest) => {
    setSelectedWashRequest(washRequest);
    setShowEditDialog(true);
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
          <Button onClick={() => setShowNewBookingDialog(true)}>
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
                    actions={
                      <WashRequestActions
                        requestId={request.id}
                        status={request.status}
                        onEdit={() => handleEditWashRequest(request)}
                      />
                    }
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active bookings</p>
                  <Button onClick={() => setShowNewBookingDialog(true)}>
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
      </div>
      
      <Dialog open={showNewBookingDialog} onOpenChange={setShowNewBookingDialog}>
        <DialogContent className="w-full max-w-lg py-6 max-h-[90vh] overflow-hidden flex flex-col">
          <CreateWashRequestForm 
            onSuccess={() => setShowNewBookingDialog(false)}
            onCancel={() => setShowNewBookingDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <CompletedWashDetailDialog
        open={showCompletedDialog}
        onOpenChange={(open) => {
          setShowCompletedDialog(open);
          if (!open) setSelectedWashRequest(null);
        }}
        washRequest={selectedWashRequest}
      />
      
      <EditWashRequestDialog 
        washRequest={selectedWashRequest}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </AppLayout>
  );
};

export default BookingsPage;
