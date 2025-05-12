
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { WashProvider } from "@/contexts/WashContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { RadarProvider } from "@/contexts/RadarContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  // This is fine as this is the only Router in the app now
  return (
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <Router>
        <AuthProvider>
          <VehicleProvider>
            <WashProvider>
              <LocationProvider>
                <RadarProvider>
                  {children}
                  <Toaster />
                  <SonnerToaster />
                </RadarProvider>
              </LocationProvider>
            </WashProvider>
          </VehicleProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
