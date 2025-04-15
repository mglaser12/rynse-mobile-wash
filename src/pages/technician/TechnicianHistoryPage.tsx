
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WashRequest } from "@/models/types";
import { Loader2, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobHistory } from "@/components/technician/JobHistory";
import { RequestDetailDialog } from "@/components/technician/RequestDetailDialog";
import { useWashManagement } from "@/hooks/technician/useWashManagement";

const TechnicianHistoryPage = () => {
  const { 
    user,
    localStateRequests,
    isLoading,
    isUpdating,
    selectedRequestId,
    setSelectedRequestId,
    handleAcceptRequest,
    handleScheduleJob,
    handleStartWash,
    handleCompleteWash,
    handleViewJobDetails,
    loadData
  } = useWashManagement();

  // Get completed requests
  const completedRequests = Array.isArray(localStateRequests)
    ? localStateRequests.filter(req => req.status === "completed" && req.technician === user?.id)
    : [];

  // Get selected request
  const selectedRequest = selectedRequestId && Array.isArray(localStateRequests)
    ? localStateRequests.find(req => req.id === selectedRequestId) 
    : null;

  return (
    <AppLayout>
      <div className="car-wash-container animate-fade-in p-4">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6 text-brand-primary" />
          <h1 className="text-2xl font-bold">Job History</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <JobHistory 
            completedJobs={completedRequests} 
            onViewJobDetails={handleViewJobDetails} 
          />
        )}
      </div>

      {/* Request Detail Dialog */}
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
        readOnly={true}
      />
    </AppLayout>
  );
};

export default TechnicianHistoryPage;
