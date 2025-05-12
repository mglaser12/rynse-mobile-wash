
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { CreateWashRequestForm } from "@/components/booking/CreateWashRequestForm";
import { useWashRequests } from "@/contexts/WashContext";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Car, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EditWashRequestDialog } from "@/components/wash/EditWashRequestDialog";
import { WashRequestActions } from "@/components/wash/WashRequestActions";
import { WashRequest } from "@/models/types";

const CustomerHome = () => {
  const { user } = useAuth();
  const { washRequests, isLoading } = useWashRequests();
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [selectedWashRequest, setSelectedWashRequest] = useState<WashRequest | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Filter wash requests the same way as BookingsPage
  const activeRequests = washRequests.filter(req => 
    ["pending", "confirmed", "in_progress"].includes(req.status)
  );
  
  const completedRequests = washRequests.filter(req => req.status === "completed");
  const cancelledRequests = washRequests.filter(req => req.status === "cancelled");

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
              <h1 className="text-xl font-bold">ABC Denver</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
            </div>
          </div>
          <Button onClick={() => setShowNewRequestDialog(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Schedule a Wash
          </Button>
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in p-4">
        <Card className="mb-5 overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary">
          <CardContent className="p-5 text-white">
            <h2 className="text-xl font-bold">Mobile Car Wash Services</h2>
            <p className="text-sm opacity-90">
              Professional car washing when and where you need it.
            </p>
            <Button 
              variant="secondary" 
              className="mt-3" 
              onClick={() => setShowNewRequestDialog(true)}
            >
              Schedule a Wash
            </Button>
          </CardContent>
        </Card>
        
        <h2 className="text-lg font-semibold mb-3">Your Wash Requests</h2>
        
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
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-3">No active wash appointments</p>
                  <Button onClick={() => setShowNewRequestDialog(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
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
                    showDetailsButton={true}
                  />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No completed washes</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cancelled" className="pt-4 space-y-4">
              {cancelledRequests.length > 0 ? (
                cancelledRequests.map(request => (
                  <WashRequestCard key={request.id} washRequest={request} />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No cancelled bookings</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        <Alert className="mt-6">
          <AlertDescription>
            Need to modify a booking? Contact our support team for assistance.
          </AlertDescription>
        </Alert>
      </div>
      
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="w-full max-w-lg py-6 max-h-[90vh] overflow-hidden flex flex-col">
          <CreateWashRequestForm 
            onSuccess={() => setShowNewRequestDialog(false)}
            onCancel={() => setShowNewRequestDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      <EditWashRequestDialog 
        washRequest={selectedWashRequest}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </AppLayout>
  );
};

export default CustomerHome;
