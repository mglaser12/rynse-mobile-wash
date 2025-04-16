
import { createContext, useContext } from "react";
import { AuthContextType } from "./types";

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true, // Default to true so components know we're checking auth
  user: null,
  login: async () => null,
  register: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
