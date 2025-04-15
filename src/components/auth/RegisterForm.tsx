
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password, role);
      toast.success("Registration successful! Please login to continue.");
      // Redirect to login view
      onLoginClick();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <img 
            src="/public/lovable-uploads/3d6deccc-d4a2-4bfb-9acc-18c6e46f5b73.png" 
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
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
              onChange={(e) => setConfirmPassword(e.target.value)}
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
