
import React from "react";
import { WashRequest } from "@/models/types";

interface DebugPanelProps {
  pendingRequests: WashRequest[];
  assignedRequests: WashRequest[];
  inProgressRequests: WashRequest[];
  washRequests: WashRequest[];
  userId?: string;
  userRole?: string;
  localStateRequests: WashRequest[];
  onRefresh: () => void;
}

export const DebugPanel = ({
  pendingRequests,
  assignedRequests,
  inProgressRequests,
  washRequests,
  userId,
  userRole,
  localStateRequests,
  onRefresh
}: DebugPanelProps) => {
  return (
    <div className="bg-gray-100 p-4 mb-6 rounded-lg text-xs overflow-auto max-h-48">
      <h3 className="font-bold mb-2">Debug Information:</h3>
      <p>Pending requests: {pendingRequests.length}</p>
      <p>Assigned requests: {assignedRequests.length}</p>
      <p>In-progress requests: {inProgressRequests.length}</p>
      <p>Total requests: {washRequests.length}</p>
      <p>User ID: {userId}</p>
      <p>User Role: {userRole}</p>
      <pre className="mt-2 bg-gray-200 p-2 rounded overflow-auto">
        {JSON.stringify(localStateRequests.map(r => ({id: r.id, status: r.status, technician: r.technician})), null, 2)}
      </pre>
      <button 
        className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
        onClick={onRefresh}
      >
        Force Refresh
      </button>
    </div>
  );
};
