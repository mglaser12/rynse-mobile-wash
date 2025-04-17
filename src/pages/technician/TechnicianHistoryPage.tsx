import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WashRequest } from "@/models/types";
import { FileText, Loader2 } from "lucide-react";
import { JobHistory } from "@/components/technician/JobHistory";
import { RequestDetailDialog } from "@/components/technician/RequestDetailDialog";
import { useWashManagement } from "@/hooks/technician/wash-management";
import { CompletedWashDetailDialog } from "@/components/technician/CompletedWashDetailDialog";
const TechnicianHistoryPage = () => {
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
    handleViewJobDetails,
    loadData
  } = useWashManagement();
  const [selectedCompletedWash, setSelectedCompletedWash] = useState<WashRequest | null>(null);

  // Initialize component on mount
  useEffect(() => {
    // Force refresh data when component mounts
    loadData();
  }, [loadData]);

  // Get completed requests
  const completedRequests = Array.isArray(washRequests) ? washRequests.filter(req => req.status === "completed" && req.technician === user?.id) : [];

  // Get selected request
  const selectedRequest = selectedRequestId && Array.isArray(washRequests) ? washRequests.find(req => req.id === selectedRequestId) : null;
  const handleViewCompletedWashDetails = (requestId: string) => {
    const washRequest = washRequests.find(req => req.id === requestId);
    if (washRequest && washRequest.status === "completed") {
      setSelectedCompletedWash(washRequest);
    }
  };
  return <AppLayout>
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex items-center">
          <img src="/lovable-uploads/f034f09f-f251-4e4d-b07a-c3513d3a4e04.png" alt="Rynse Icon" className="h-8 mr-3 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">Job History</h1>
            <p className="text-sm text-muted-foreground">Review completed wash requests</p>
          </div>
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in p-4">
        
        
        {isLoading ? <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div> : <JobHistory completedJobs={completedRequests} onViewJobDetails={requestId => handleViewCompletedWashDetails(requestId)} />}
      </div>

      {/* Request Detail Dialog */}
      <RequestDetailDialog open={!!selectedRequestId} onOpenChange={open => !open && setSelectedRequestId(null)} selectedRequest={selectedRequest} userId={user?.id} isUpdating={isUpdating} onAcceptRequest={handleAcceptRequest} onStartWash={handleStartWash} onCompleteWash={handleCompleteWash} onScheduleJob={handleScheduleJob} readOnly={true} />
      
      {/* Completed Wash Detail Dialog */}
      <CompletedWashDetailDialog open={!!selectedCompletedWash} onOpenChange={open => !open && setSelectedCompletedWash(null)} washRequest={selectedCompletedWash} />
    </AppLayout>;
};
export default TechnicianHistoryPage;