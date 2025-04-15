
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useWashRequests } from "@/contexts/WashContext";
import { toast } from "sonner";

interface TechnicianHeaderProps {
  userName?: string;
  onRefresh?: () => void;
}

export const TechnicianHeader = ({ userName, onRefresh }: TechnicianHeaderProps) => {
  const { isLoading } = useWashRequests();
  
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast.info("Refreshing data...");
    } else {
      // Fallback to page reload
      window.location.reload();
      toast.info("Refreshing data...");
    }
  };
  
  return (
    <header className="bg-white p-4 border-b sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Technician Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {userName || 'Technician'}</p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          <span>Refresh</span>
        </Button>
      </div>
    </header>
  );
};
