
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/models/types";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatAuthError } from "@/contexts/auth/errors/authErrorHandler";

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const { register, isLoading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("fleet_manager");
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setRegisterError("Please fill in all required fields");
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setRegisterError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setRegisterError("Password must be at least 6 characters long");
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    setRegisterError(null);
    
    try {
      // Pass the role directly - our updated register function will validate it
      await register(email, password, name, role);
      
      // Success handling and redirection happens in the register function
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegisterError(formatAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const renderErrorMessage = () => {
    if (!registerError) return null;
    
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{registerError}</AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <img 
            src="/lovable-uploads/9d7f6327-fc2e-40f2-8820-dece2ae620b9.png" 
            alt="Rynse Icon" 
            className="h-10 w-10" 
          />
        </div>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Sign up to get started with Rynse Mobile Wash
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Smith"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setRegisterError(null);
              }}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setRegisterError(null);
              }}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setRegisterError(null);
              }}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setRegisterError(null);
              }}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Account Type</Label>
            <RadioGroup 
              value={role} 
              onValueChange={(value) => setRole(value as UserRole)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fleet_manager" id="fleet_manager" />
                <Label htmlFor="fleet_manager">Fleet Manager</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="technician" id="technician" />
                <Label htmlFor="technician">Wash Technician</Label>
              </div>
            </RadioGroup>
          </div>
          
          {renderErrorMessage()}
          
          <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
              </>
            ) : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full">
          <span className="text-muted-foreground">Already have an account?</span>{" "}
          <Button variant="link" className="p-0 h-auto" onClick={onLoginClick}>
            Sign in
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
