
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

  // Get assigned requests
  const assignedRequests = Array.isArray(washRequests) 
    ? washRequests.filter(req => req.status === "confirmed" && req.technician === user?.id)
    : [];

  // Get selected request
  const selectedRequest = selectedRequestId && Array.isArray(washRequests)
    ? washRequests.find(req => req.id === selectedRequestId) 
    : null;

  return (
    <AppLayout>
      <div className="car-wash-container animate-fade-in p-4">
        <h1 className="text-2xl font-bold mb-6">Job Calendar</h1>
        
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
