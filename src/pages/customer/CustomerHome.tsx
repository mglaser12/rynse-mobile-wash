
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { AppLayout } from "@/components/layout/AppLayout";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { CreateWashRequestForm } from "@/components/booking/CreateWashRequestForm";
import { useWashRequests } from "@/contexts/WashContext";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Car, Loader2, CalendarDays } from "lucide-react";
import { EditWashRequestDialog } from "@/components/wash/EditWashRequestDialog";
import { WashRequestActions } from "@/components/wash/WashRequestActions";
import { WashRequest } from "@/models/types";
import { format, isAfter, isSameDay, parseISO } from "date-fns";
import { CustomerCalendarView } from "@/components/customer/CustomerCalendarView";

const CustomerHome = () => {
  const { user } = useAuth();
  const { washRequests, isLoading } = useWashRequests();
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [selectedWashRequest, setSelectedWashRequest] = useState<WashRequest | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);

  // Filter wash requests for active ones
  const activeRequests = washRequests.filter(req => 
    ["pending", "confirmed", "in_progress"].includes(req.status)
  );
  
  // Filter for upcoming washes (today and future dates)
  const upcomingRequests = washRequests.filter(req => {
    if (!req.preferredDates?.start) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const washDate = new Date(req.preferredDates.start);
    washDate.setHours(0, 0, 0, 0);
    
    return (isSameDay(washDate, today) || isAfter(washDate, today)) && 
           req.status !== 'cancelled';
  });

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
        
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Your Wash Requests</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Calendar View</span>
            <Switch 
              checked={showCalendarView} 
              onCheckedChange={setShowCalendarView}
            />
            <CalendarDays className="h-4 w-4 text-muted-foreground ml-1" />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <>
            {showCalendarView ? (
              <CustomerCalendarView 
                washRequests={washRequests}
                onSelectRequest={(request) => {
                  setSelectedWashRequest(request);
                  setShowEditDialog(true);
                }}
              />
            ) : (
              <div className="space-y-4">
                <h3 className="text-md font-medium mb-2">Active Requests</h3>
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
                  <div className="text-center py-10 bg-muted rounded-md">
                    <p className="text-muted-foreground mb-3">No active wash appointments</p>
                    <Button onClick={() => setShowNewRequestDialog(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Schedule a Wash
                    </Button>
                  </div>
                )}
                
                {upcomingRequests.length > 0 && (
                  <>
                    <h3 className="text-md font-medium mt-6 mb-2">Upcoming Washes</h3>
                    <div className="space-y-3">
                      {upcomingRequests
                        .sort((a, b) => new Date(a.preferredDates.start).getTime() - new Date(b.preferredDates.start).getTime())
                        .map(request => (
                          <WashRequestCard 
                            key={request.id} 
                            washRequest={request}
                            showDetailsButton={true}
                            onClick={() => handleEditWashRequest(request)}
                          />
                        ))
                      }
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
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
