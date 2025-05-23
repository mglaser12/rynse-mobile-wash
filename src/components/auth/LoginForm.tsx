
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatAuthError } from "@/contexts/auth/errors/authErrorHandler";

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const { login, refreshSession, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const loginAttemptRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successCallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
      const inputs = document.querySelectorAll('input');
      
      const handleInputTouch = (e: Event) => {
        const input = e.target as HTMLInputElement;
        setTimeout(() => {
          input.focus();
        }, 10);
      };
      
      inputs.forEach(input => {
        input.addEventListener('touchstart', handleInputTouch);
      });
      
      return () => {
        inputs.forEach(input => {
          input.removeEventListener('touchstart', handleInputTouch);
        });
      };
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLoginError("Please enter both email and password");
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    setLoginAttempted(true);
    setLoginError(null);
    setLoginAttempts(prev => prev + 1);
    
    try {
      console.log("Attempting login with email:", email);
      const user = await login(email, password);
      console.log("Login result:", user ? "User obtained" : "No user returned");
      
      if (user) {
        console.log("Login successful, calling onSuccess callback");
        
        // Clear any existing timeouts
        if (loginAttemptRef.current) {
          clearTimeout(loginAttemptRef.current);
        }
        
        if (successCallbackTimeoutRef.current) {
          clearTimeout(successCallbackTimeoutRef.current);
        }
        
        // Force a session refresh before redirecting
        await refreshSession();
        console.log("Session refreshed after successful login");
        
        // Set a safety timeout to ensure we don't get stuck
        successCallbackTimeoutRef.current = setTimeout(() => {
          console.log("Login success timeout triggered - forcing callback");
          if (onSuccess) onSuccess();
        }, 1000);
        
        // Call immediately but also have the safety timeout
        if (onSuccess) onSuccess();
      } else {
        console.log("Login failed, no user returned");
        setLoginError("Login failed. Please check your credentials and try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(formatAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (loginAttemptRef.current) {
        clearTimeout(loginAttemptRef.current);
      }
      if (successCallbackTimeoutRef.current) {
        clearTimeout(successCallbackTimeoutRef.current);
      }
    };
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setLoginError(null);
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setLoginError(null);
  };

  const renderErrorMessage = () => {
    if (!loginError) return null;
    
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{loginError}</AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <img 
            src="/lovable-uploads/3d6deccc-d4a2-4bfb-9acc-18c6e46f5b73.png" 
            alt="Rynse Icon" 
            className="h-10 w-10" 
          />
        </div>
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              className="w-full"
              autoComplete="email"
              ref={emailInputRef}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button variant="link" className="p-0 h-auto text-xs" type="button">
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              className="w-full"
              autoComplete="current-password"
              ref={passwordInputRef}
            />
          </div>
          
          {renderErrorMessage()}
          
          <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : "Sign In"}
          </Button>
          
          {loginAttempts > 2 && (
            <p className="text-sm text-center text-amber-600">
              Having trouble logging in? Try clearing your browser cache and cookies, then try again.
            </p>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center">
          <span className="text-muted-foreground">Don't have an account?</span>{" "}
          <Button variant="link" className="p-0 h-auto" onClick={onRegisterClick}>
            Sign up
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
