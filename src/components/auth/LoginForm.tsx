
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  // Fix for iOS focus issues
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
      const inputs = document.querySelectorAll('input');
      
      const handleInputTouch = (e: Event) => {
        const input = e.target as HTMLInputElement;
        // Small delay seems to help iOS
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
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login...");
      const user = await login(email, password);
      console.log("Login successful, user:", user ? "User obtained" : "No user returned");
      if (user && onSuccess) {
        console.log("Calling onSuccess callback");
        onSuccess();
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Special handler for iOS inputs
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
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
          <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : "Sign In"}
          </Button>
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
