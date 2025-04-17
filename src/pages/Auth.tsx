
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const authCheckCompleted = React.useRef(false);

  // Get the intended redirect path from location state, or default to "/"
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    // Only redirect when we're sure authentication is complete and successful
    if (isAuthenticated && !isLoading) {
      console.log("Auth page detected authenticated user, redirecting to:", from);
      navigate(from, { replace: true });
    }
    
    // Mark auth check as completed once loading is done
    if (!isLoading) {
      authCheckCompleted.current = true;
    }

    // Set a timeout to detect if authentication takes too long
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Auth check taking longer than expected");
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, isLoading, navigate, from]);

  // Don't render anything during the initial loading state to prevent flicker
  if (isLoading && !authCheckCompleted.current) {
    return (
      <AppLayout hideNavigation>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading authentication...</p>
            {loadingTimeout && (
              <Alert className="mt-4 max-w-md mx-auto">
                <AlertDescription>
                  Authentication is taking longer than expected. Please be patient...
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Redirect immediately if already authenticated
  if (isAuthenticated) {
    console.log("Auth page immediate redirect to:", from);
    return <Navigate to={from} replace />;
  }

  const handleSuccess = () => {
    console.log("Auth success, navigating to:", from);
    navigate(from, { replace: true });
  };

  // Track auth flow errors
  const handleAuthError = (error: string) => {
    setAuthError(error);
    console.error("Authentication error:", error);
  };

  return (
    <AppLayout hideNavigation>
      <div className="car-wash-container pt-10">
        <div className="mb-10 text-center">
          <div className="flex justify-center items-center mb-4">
            <img 
              src="/lovable-uploads/5e29517a-c169-4798-98fa-075394612b76.png" 
              alt="Rynse Logo" 
              className="h-12" 
            />
          </div>
          <p className="text-muted-foreground">Mobile wash services</p>
        </div>
        
        {authError && (
          <Alert variant="destructive" className="mb-6 max-w-md mx-auto">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        
        {currentView === "login" ? (
          <LoginForm 
            onRegisterClick={() => {
              setCurrentView("register");
              setAuthError(null);
            }}
            onSuccess={handleSuccess}
          />
        ) : (
          <RegisterForm 
            onLoginClick={() => {
              setCurrentView("login");
              setAuthError(null);
            }}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Auth;
