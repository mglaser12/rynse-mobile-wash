
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { WashProvider } from "@/contexts/WashContext";
import { Loader2 } from "lucide-react";

import Auth from "./pages/Auth";
import CustomerHome from "./pages/customer/CustomerHome";
import VehiclesPage from "./pages/customer/VehiclesPage";
import BookingsPage from "./pages/customer/BookingsPage";
import TechnicianHome from "./pages/technician/TechnicianHome";
import TechnicianJobsPage from "./pages/technician/TechnicianJobsPage";
import ProfilePage from "./pages/ProfilePage";
import OrganizationPage from "./pages/admin/OrganizationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Route guard component with useLocation to avoid render loops
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Role-specific route component
const RoleRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode;
  allowedRole: "customer" | "technician" | "admin";
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  
  // Render different home page based on user role
  const renderHome = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }
    
    return user?.role === "technician" ? (
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
              <TechnicianJobsPage />
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
      
      {/* Admin Routes */}
      <Route 
        path="/admin/organizations" 
        element={
          <PrivateRoute>
            <OrganizationPage />
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

// App loading component to show initial loading state
const AppWithProviders = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VehicleProvider>
          <WashProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </WashProvider>
        </VehicleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppWithProviders />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
