import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "./types";
import { getUsers, getFromStorage } from "./data";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const CURRENT_USER_KEY = 'taskflow-current-user';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = getFromStorage<User | null>(CURRENT_USER_KEY, null);
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (phone: string, password: string): Promise<boolean> => {
    // In a real app, we would validate against a backend and send SMS verification
    // For demo purposes, we'll just check if the user exists
    const users = getUsers();
    const user = users.find(u => u.phone === phone);
    
    if (user) {
      // In a real app, we would verify SMS verification code here
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};