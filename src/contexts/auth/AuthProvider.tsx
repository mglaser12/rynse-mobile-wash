
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "./useAuth";
import { useAuthMethods } from "./hooks/useAuthMethods";
import { useSession } from "./hooks/useSession";
import { useAuthSubscription } from "./hooks/useAuthSubscription";
import { logAuthError } from "./errors/authErrorHandler";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { 
    isLoading: authMethodsLoading, 
    login, 
    register, 
    logout, 
    lastError, 
    refreshSession 
  } = useAuthMethods();
  
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
  const authStateUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Track auth errors for debugging
  useEffect(() => {
    if (lastError) {
      setAuthError(lastError);
      logAuthError("AuthProvider detected error", lastError);
    }
  }, [lastError]);
  
  // Setup auth subscription with better error handling
  useAuthSubscription(
    (user) => {
      console.log("Auth subscription updating user:", user ? `User ${user.id} (${user.role || 'no role'})` : "No user");
      
      // Clear any pending timeout
      if (authStateUpdateTimer.current) {
        clearTimeout(authStateUpdateTimer.current);
      }
      
      // Schedule an immediate update but use setTimeout to avoid race conditions
      authStateUpdateTimer.current = setTimeout(() => {
        setUser(user);
        setIsAuthenticated(!!user);
        if (user) setAuthError(null);
        console.log("Auth state updated successfully via subscription");
      }, 0);
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

  // Force a session check when route changes
  useEffect(() => {
    if (location.pathname) {
      console.log("Route changed to:", location.pathname, "- checking session");
      refreshSession().catch(error => {
        console.error("Failed to refresh session on route change:", error);
      });
    }
  }, [location.pathname, refreshSession]);
  
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
    }, 20000);
    
    return () => {
      clearTimeout(safetyTimeoutId);
      if (authStateUpdateTimer.current) {
        clearTimeout(authStateUpdateTimer.current);
      }
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
    refreshSession,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
