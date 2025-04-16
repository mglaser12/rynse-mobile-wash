
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { WashProvider } from "@/contexts/WashContext";
import { LocationProvider } from "@/contexts/LocationContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <Router>
        <AuthProvider>
          <VehicleProvider>
            <WashProvider>
              <LocationProvider>
                {children}
                <Toaster />
                <SonnerToaster />
              </LocationProvider>
            </WashProvider>
          </VehicleProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
