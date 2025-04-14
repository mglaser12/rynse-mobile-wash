
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { WashProvider } from "@/contexts/WashContext";

import Auth from "./pages/Auth";
import CustomerHome from "./pages/customer/CustomerHome";
import VehiclesPage from "./pages/customer/VehiclesPage";
import BookingsPage from "./pages/customer/BookingsPage";
import TechnicianHome from "./pages/technician/TechnicianHome";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import { Badge } from "./components/ui/badge";

const queryClient = new QueryClient();

// Route guard component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

// Role-specific route component
const RoleRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode;
  allowedRole: "customer" | "technician";
}) => {
  const { user } = useAuth();
  
  if (user?.role !== allowedRole) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  // Render different home page based on user role
  const renderHome = () => {
    if (!user) return <Navigate to="/auth" />;
    
    return user.role === "technician" ? (
      <TechnicianHome />
    ) : (
      <CustomerHome />
    );
  };
  
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            {renderHome()}
          </PrivateRoute>
        } 
      />
      
      {/* Customer Routes */}
      <Route 
        path="/vehicles" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRole="customer">
              <VehiclesPage />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/bookings" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRole="customer">
              <BookingsPage />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      
      {/* Technician Routes */}
      <Route 
        path="/jobs" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRole="technician">
              <div>Jobs Page (Coming Soon)</div>
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/history" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRole="technician">
              <div>History Page (Coming Soon)</div>
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      
      {/* Common Routes */}
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <VehicleProvider>
          <WashProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </WashProvider>
        </VehicleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
