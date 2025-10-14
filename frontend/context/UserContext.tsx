// context/UserContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  es_cuidador: boolean;
  es_cliente: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
  refreshUnreadStatus: () => Promise<void>;
  isAdmin: () => boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const userData = await apiGet<User>("/users/me/");
      setUser(userData);
    } catch (error) {
      // Clear user state on authentication errors
      setUser(null);
      // Don't throw the error, just clear the user state
    } finally {
      setIsLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    setIsLoading(false);
  };

  const refreshUnreadStatus = async () => {
    window.dispatchEvent(new CustomEvent('refreshUnreadStatus'));
  };

  const isAdmin = (): boolean => {
    return user ? Boolean(user.is_staff || user.is_superuser) : false;
  };

  useEffect(() => {
    fetchUser();
    
    // Listen for authentication errors from API calls
    const handleAuthError = () => {
      clearUser();
    };
    
    window.addEventListener('authError', handleAuthError);
    return () => window.removeEventListener('authError', handleAuthError);
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      refreshUser: fetchUser, 
      clearUser,
      refreshUnreadStatus, 
      isAdmin 
    }}>
      {children}
    </UserContext.Provider>
  );
}

// Keep the original useUser hook for backward compatibility
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context.user; // Return just the user, not the full context
}

// Add a new hook for when you need the refresh function
export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context; // Return the full context with user and refreshUser
}