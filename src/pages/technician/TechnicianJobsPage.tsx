
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WashRequest } from "@/models/types";
import { Loader2 } from "lucide-react";
import { useWashManagement } from "@/hooks/technician/useWashManagement";
import { RequestDetailDialog } from "@/components/technician/RequestDetailDialog";
import { JobCalendarView } from "@/components/technician/JobCalendarView";

const TechnicianJobsPage = () => {
  const { 
    user,
    washRequests,
    isLoading,
    isUpdating,
    selectedRequestId,
    setSelectedRequestId,
    handleAcceptRequest,
    handleScheduleJob,
    handleStartWash,
    handleCompleteWash,
    loadData
  } = useWashManagement();

  // Get assigned requests with proper null checking
  const assignedRequests = Array.isArray(washRequests) 
    ? washRequests.filter(req => req.status === "confirmed" && req.technician === user?.id)
    : [];

  // Get selected request with proper null checking
  const selectedRequest = selectedRequestId && Array.isArray(washRequests)
    ? washRequests.find(req => req.id === selectedRequestId) 
    : null;

  return (
    <AppLayout>
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/f034f09f-f251-4e4d-b07a-c3513d3a4e04.png" 
            alt="Rynse Icon" 
            className="h-8 mr-3 rounded-full" 
          />
          <div>
            <h1 className="text-2xl font-bold">Job Calendar</h1>
            <p className="text-sm text-muted-foreground">View and manage your assigned jobs</p>
          </div>
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <JobCalendarView 
            assignedRequests={assignedRequests} 
            onSelectJob={setSelectedRequestId} 
          />
        )}
      </div>

      {/* Request Detail Dialog with Scheduling */}
      <RequestDetailDialog
        open={!!selectedRequestId}
        onOpenChange={(open) => !open && setSelectedRequestId(null)}
        selectedRequest={selectedRequest}
        userId={user?.id}
        isUpdating={isUpdating}
        onAcceptRequest={handleAcceptRequest}
        onStartWash={handleStartWash}
        onCompleteWash={handleCompleteWash}
        onScheduleJob={handleScheduleJob}
      />
    </AppLayout>
  );
};

export default TechnicianJobsPage;
