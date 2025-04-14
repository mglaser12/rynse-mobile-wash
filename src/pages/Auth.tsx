
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

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSuccessfulAuth = () => {
    navigate("/");
  };

  return (
    <AppLayout hideNavigation>
      <div className="car-wash-container pt-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-brand-primary">Shine Mobile Fleet</h1>
          <p className="text-muted-foreground">Wash services on demand</p>
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
