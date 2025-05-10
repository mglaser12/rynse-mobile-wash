
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { PwaDialogContent } from "@/components/ui/pwa-dialog"; // Use the PWA-optimized dialog
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { CreateWashRequestForm } from "@/components/booking/CreateWashRequestForm";
import { useWashRequests } from "@/contexts/WashContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, PlusCircle } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog"; // Import DialogTitle for accessibility

const CustomerHome = () => {
  const { user } = useAuth();
  const { washRequests, isLoading } = useWashRequests();
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [dialogClosing, setDialogClosing] = useState(false);

  // Filter requests by status
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
          setShowNewRequestDialog(false);
          setDialogClosing(false);
        });
      });
    } else if (open) {
      setShowNewRequestDialog(true);
    }
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
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in">
        <Card className="mb-5 overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary">
          <CardContent className="p-5 text-white">
            <h2 className="text-xl font-bold">Mobile Car Wash Services</h2>
            <p className="text-sm opacity-90">
              Professional car washing when and where you need it.
            </p>
            <Button 
              variant="secondary" 
              className="mt-3" 
              onClick={() => handleOpenDialogChange(true)}
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
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-3">No active wash appointments</p>
                  <Button onClick={() => handleOpenDialogChange(true)}>
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
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No completed washes</p>
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
                  <p className="text-muted-foreground">No cancelled washes</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <Dialog open={showNewRequestDialog} onOpenChange={handleOpenDialogChange}>
        <PwaDialogContent className="w-full max-w-lg py-6 max-h-[90vh] overflow-hidden flex flex-col">
          {showNewRequestDialog && ( // Only render form when dialog is actually open
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
    </AppLayout>
  );
};

export default CustomerHome;
