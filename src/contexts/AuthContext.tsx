
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

export type UserRole = "customer" | "technician";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
}

// Mock user data for demonstration
const MOCK_USERS = [
  {
    id: "1",
    name: "John Customer",
    email: "customer@example.com",
    password: "password123",
    role: "customer" as UserRole,
    profileImage: "https://i.pravatar.cc/150?u=customer"
  },
  {
    id: "2",
    name: "Tech Support",
    email: "tech@example.com",
    password: "password123",
    role: "technician" as UserRole,
    profileImage: "https://i.pravatar.cc/150?u=technician"
  }
];

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email and password
    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
    } else {
      toast.error("Invalid email or password");
      throw new Error("Invalid credentials");
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    toast.info("You have been logged out");
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      toast.error("Email already exists");
      throw new Error("Email already exists");
    }

    // Create new user
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      profileImage: `https://i.pravatar.cc/150?u=${role}-${email}`
    };

    // Set the user and save to localStorage
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(newUser));
    toast.success("Registration successful!");
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
