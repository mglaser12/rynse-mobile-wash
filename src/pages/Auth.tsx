
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentView, setCurrentView] = useState<"login" | "register">("login");
  const navigate = useNavigate();

  // Use useEffect for navigation to avoid render loops
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSuccessfulAuth = () => {
    navigate("/");
  };

  // Don't return Navigate directly in render to avoid render loops
  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <AppLayout hideNavigation>
      <div className="car-wash-container pt-10">
        <div className="mb-10 text-center">
          <img 
            src="https://assets.website-files.com/62a8107832c78d2f3800033c/62a8107832c78d5450000393_Group%2013473.svg" 
            alt="Rynse Logo" 
            className="h-12 mx-auto mb-4" 
          />
          <p className="text-muted-foreground">Mobile wash services</p>
        </div>
        
        {currentView === "login" ? (
          <LoginForm 
            onRegisterClick={() => setCurrentView("register")}
            onSuccess={handleSuccessfulAuth}
          />
        ) : (
          <RegisterForm 
            onLoginClick={() => setCurrentView("login")}
            onSuccess={handleSuccessfulAuth}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Auth;
