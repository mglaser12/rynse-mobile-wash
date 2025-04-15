
import React from "react";
import { User } from "@supabase/supabase-js";

interface TechnicianHeaderProps {
  userName?: string;
}

export const TechnicianHeader = ({ userName }: TechnicianHeaderProps) => {
  return (
    <header className="bg-white p-4 border-b sticky top-0 z-10">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">Technician Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome, {userName}</p>
      </div>
    </header>
  );
};
