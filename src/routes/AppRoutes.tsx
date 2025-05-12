
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

import Auth from "../pages/Auth";
import CustomerHome from "../pages/customer/CustomerHome";
import VehiclesPage from "../pages/customer/VehiclesPage";
import BookingsPage from "../pages/customer/BookingsPage";
import LocationsPage from "../pages/customer/LocationsPage";
import TechnicianHome from "../pages/technician/TechnicianHome";
import TechnicianJobsPage from "../pages/technician/TechnicianJobsPage";
import TechnicianHistoryPage from "../pages/technician/TechnicianHistoryPage";
import ProfilePage from "../pages/ProfilePage";
import OrganizationPage from "../pages/admin/OrganizationPage";
import NotFound from "../pages/NotFound";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Route guard component with useLocation to avoid render loops
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // If we're on the auth page and loading, show the auth page
  if (location.pathname === '/auth') {
    return <>{children}</>;
  }
  
  // Only show loading state on initial auth check
  if (isLoading && !user) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Role-specific route component - Modified to allow customers to access fleet_manager routes
export const RoleRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode;
  allowedRole: "customer" | "technician" | "admin" | "fleet_manager";
}) => {
  const { user, isLoading } = useAuth();
  
  // Only show loading if we don't have user data yet
  if (isLoading && !user) {
    return <LoadingSpinner />;
  }
  
  // Modified logic: Allow customer access to both customer and fleet_manager routes
  if (allowedRole === "fleet_manager") {
    // Allow both fleet managers and customers to access fleet_manager routes
    if (user?.role !== "fleet_manager" && user?.role !== "customer") {
      return <Navigate to="/" replace />;
    }
  } else if (user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  
  // Render different home page based on user role
  const renderHome = () => {
    if (isLoading && !user) {
      return <LoadingSpinner />;
    }
    
    return user?.role === "technician" ? (
      <TechnicianHome />
    ) : (
      <CustomerHome />
    );
  };
  
  return (
    <Routes>
      {/* Auth route - no protection needed */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected routes */}
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
      
      {/* Fleet Manager Routes */}
      <Route 
        path="/locations" 
        element={
          <PrivateRoute>
            <RoleRoute allowedRole="fleet_manager">
              <LocationsPage />
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
              <TechnicianHistoryPage />
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
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;