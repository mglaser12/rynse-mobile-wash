
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { WashProvider } from "@/contexts/WashContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { MapProvider } from "@/contexts/MapContext";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider defaultTheme="light" storageKey="rynse-theme">
          <AuthProvider>
            <LocationProvider>
              <VehicleProvider>
                <WashProvider>
                  <MapProvider>
                    {children}
                    <Toaster />
                  </MapProvider>
                </WashProvider>
              </VehicleProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
};
