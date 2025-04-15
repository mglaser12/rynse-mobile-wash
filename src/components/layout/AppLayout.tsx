
import React from "react";
import { MobileNavigation } from "./MobileNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { OfflineIndicator } from "./OfflineIndicator";

interface AppLayoutProps {
  children: React.ReactNode;
  hideNavigation?: boolean;
}

export function AppLayout({ children, hideNavigation = false }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16">
        {children}
      </main>
      
      {isAuthenticated && !hideNavigation && <MobileNavigation />}
      <OfflineIndicator />
    </div>
  );
}
