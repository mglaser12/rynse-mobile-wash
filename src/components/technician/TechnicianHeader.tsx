
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useWashRequests } from "@/contexts/WashContext";
import { toast } from "sonner";

interface TechnicianHeaderProps {
  userName?: string;
}

export const TechnicianHeader = ({ userName }: TechnicianHeaderProps) => {
  const { isLoading, refreshData } = useWashRequests();
  
  const handleRefresh = () => {
    refreshData();
    toast.info("Refreshing data...");
  };
  
  return (
    <header className="bg-white p-4 border-b sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/5e29517a-c169-4798-98fa-075394612b76.png" 
            alt="Rynse Logo" 
            className="h-8 mr-3" 
          />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Technician Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {userName || 'Technician'}</p>
          </div>
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
