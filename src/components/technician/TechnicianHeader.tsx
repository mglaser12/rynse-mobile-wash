
import React from "react";
import { useWashRequests } from "@/contexts/WashContext";
import { toast } from "sonner";

interface TechnicianHeaderProps {
  userName?: string;
}

export const TechnicianHeader = ({ userName }: TechnicianHeaderProps) => {
  const { refreshData } = useWashRequests();
  
  return (
    <header className="bg-white p-4 border-b sticky top-0 z-10">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/f034f09f-f251-4e4d-b07a-c3513d3a4e04.png" 
          alt="Rynse Icon" 
          className="h-8 mr-3 rounded-full" 
        />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Technician Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {userName || 'Technician'}</p>
        </div>
      </div>
    </header>
  );
};
