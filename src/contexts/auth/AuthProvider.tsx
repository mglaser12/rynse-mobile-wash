
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "./useAuth";
import { useAuthMethods } from "./hooks/useAuthMethods";
import { useSession } from "./hooks/useSession";

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
  
  // Debug logging
  useEffect(() => {
    console.log("Auth state update:", {
      isAuthenticated,
      isLoading: authMethodsLoading || sessionLoading,
      user: user ? `${user.id} (${user.role})` : null,
      path: location.pathname
    });
  }, [isAuthenticated, authMethodsLoading, sessionLoading, user, location.pathname]);

  const value = {
    isAuthenticated,
    isLoading: authMethodsLoading || sessionLoading,
    user,
    authError: null, // Add authError property with a default value of null
    login,
    register,
    logout,
    refreshSession: getSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
