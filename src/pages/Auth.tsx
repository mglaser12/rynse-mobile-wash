
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/auth";

const Auth = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<"login" | "register">("login");
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect when we're sure authentication is complete and successful
    if (isAuthenticated && !isLoading) {
      console.log("Auth page detected authenticated user, redirecting to home");
      navigate("/");
    }
  }, [isAuthenticated, navigate, isLoading]);

  // Don't render anything during the loading state or if already authenticated
  if (isLoading) {
    return (
      <AppLayout hideNavigation>
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      </AppLayout>
    );
  }
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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
        
        {currentView === "login" ? (
          <LoginForm 
            onRegisterClick={() => setCurrentView("register")}
            onSuccess={() => {}} // We'll handle navigation in the useEffect
          />
        ) : (
          <RegisterForm 
            onLoginClick={() => setCurrentView("login")}
            onSuccess={() => {}} // We'll handle navigation in the useEffect
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Auth;
