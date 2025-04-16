
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "./useAuth";
import { useAuthMethods } from "./hooks/useAuthMethods";
import { useSession } from "./hooks/useSession";
import { useAuthSubscription } from "./hooks/useAuthSubscription";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading: authMethodsLoading, login, register, logout } = useAuthMethods();
  const { 
    isAuthenticated, 
    isLoading: sessionLoading, 
    user, 
    setUser, 
    setIsAuthenticated, 
    getSession 
  } = useSession();
  const location = useLocation();

  // Setup auth subscription
  useAuthSubscription(
    setUser,
    setIsAuthenticated,
    (loading) => {}, // We manage loading state in useSession
    getSession
  );

  // Combine loading states
  const isLoading = authMethodsLoading || sessionLoading;

  // Debug logging
  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, isLoading, user, path: location.pathname });
  }, [isAuthenticated, isLoading, user, location]);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
