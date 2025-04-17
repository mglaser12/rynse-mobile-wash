
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "./useAuth";
import { useAuthMethods } from "./hooks/useAuthMethods";
import { useSession } from "./hooks/useSession";
import { useAuthSubscription } from "./hooks/useAuthSubscription";
import { logAuthError } from "./errors/authErrorHandler";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading: authMethodsLoading, login, register, logout, lastError } = useAuthMethods();
  const { 
    isAuthenticated, 
    isLoading: sessionLoading, 
    user, 
    setUser, 
    setIsAuthenticated, 
    getSession 
  } = useSession();
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const initialized = useRef(false);
  
  // Track auth errors for debugging
  useEffect(() => {
    if (lastError) {
      setAuthError(lastError);
      logAuthError("AuthProvider detected error", lastError);
    }
  }, [lastError]);
  
  // Setup auth subscription
  useAuthSubscription(
    (user) => {
      console.log("Auth subscription updating user:", user ? `User ${user.id} (${user.role || 'no role'})` : "No user");
      setUser(user);
      setIsAuthenticated(!!user);
      if (user) setAuthError(null);
    },
    (isAuth) => {
      console.log("Auth subscription updating authentication state:", isAuth);
      setIsAuthenticated(isAuth);
      if (isAuth) setAuthError(null);
    },
    (loading) => {
      // We handle loading state in useSession
    },
    getSession
  );

  // Combine loading states
  const isLoading = authMethodsLoading || sessionLoading;

  // Debug logging - only log once per route change
  useEffect(() => {
    if (!initialized.current || location.pathname) {
      console.log("Auth state:", { 
        isAuthenticated, 
        isLoading, 
        user: user ? `User ${user.id} (${user.role})` : null, 
        path: location.pathname,
        authError 
      });
      initialized.current = true;
    }
    
    // Add safety mechanism to prevent infinite loading state
    // INCREASED TIMEOUT: from 10 seconds to 20 seconds
    const safetyTimeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("Auth provider safety timeout triggered - forcing loading to false");
        setIsAuthenticated(!!user);
      }
    }, 20000); // Increased from 10000 to 20000
    
    return () => {
      clearTimeout(safetyTimeoutId);
    };
  }, [isAuthenticated, isLoading, user, location.pathname, setIsAuthenticated, authError]);

  // Provide auth context to all children
  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
