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
import { PlusCircle, Car } from "lucide-react";

const CustomerHome = () => {
  const { user } = useAuth();
  const { washRequests, isLoading } = useWashRequests();
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);

  const pendingRequests = washRequests.filter(req => req.status === "pending");
  const confirmedRequests = washRequests.filter(req => ["confirmed", "in_progress"].includes(req.status));
  const pastRequests = washRequests.filter(req => ["completed", "cancelled"].includes(req.status));

  return (
    <AppLayout>
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">ABC Denver</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Button onClick={() => setShowNewRequestDialog(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Schedule a Wash
          </Button>
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
              onClick={() => setShowNewRequestDialog(true)}
            >
              Schedule a Wash
            </Button>
          </CardContent>
        </Card>
        
        <h2 className="text-lg font-semibold mb-3">Your Wash Requests</h2>
        
        <Tabs defaultValue="upcoming" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="pt-4">
            {confirmedRequests.length > 0 ? (
              <div className="space-y-4">
                {confirmedRequests.map((request) => (
                  <WashRequestCard key={request.id} washRequest={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-3">No upcoming wash appointments</p>
                <Button onClick={() => setShowNewRequestDialog(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Schedule a Wash
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="pt-4">
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <WashRequestCard key={request.id} washRequest={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="pt-4">
            {pastRequests.length > 0 ? (
              <div className="space-y-4">
                {pastRequests.map((request) => (
                  <WashRequestCard key={request.id} washRequest={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No past washes</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col"
              onClick={() => setShowNewRequestDialog(true)}
            >
              <span className="text-lg">+</span>
              <span className="text-sm">Schedule a Wash</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col"
              onClick={() => {}}
            >
              <Car className="h-5 w-5 mb-1" />
              <span className="text-sm">My Vehicles</span>
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="w-full max-w-lg py-6 max-h-[90vh] overflow-hidden flex flex-col">
          <CreateWashRequestForm 
            onSuccess={() => setShowNewRequestDialog(false)}
            onCancel={() => setShowNewRequestDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CustomerHome;
