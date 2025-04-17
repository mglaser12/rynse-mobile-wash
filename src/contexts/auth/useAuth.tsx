
import { createContext, useContext } from "react";
import { User } from "./types";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  authError: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  authError: null,
  login: async () => null,
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
