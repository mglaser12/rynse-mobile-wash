
import React, { useEffect, useRef } from "react";
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
  const initialized = useRef(false);
  
  // Setup auth subscription
  useAuthSubscription(
    (user) => {
      console.log("Auth subscription updating user:", user ? `User ${user.id} (${user.role || 'no role'})` : "No user");
      setUser(user);
      setIsAuthenticated(!!user);
    },
    (isAuth) => {
      console.log("Auth subscription updating authentication state:", isAuth);
      setIsAuthenticated(isAuth);
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
        path: location.pathname 
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
  }, [isAuthenticated, isLoading, user, location.pathname, setIsAuthenticated]);

  // Provide auth context to all children
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
