// context/UserContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface User {
  id: number;
  username: string;
  es_cuidador: boolean;
  es_cliente: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

interface UserContextType {
  user: User | null;
  refreshUser: () => Promise<void>;
  refreshUnreadStatus: () => Promise<void>;
  isAdmin: () => boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const userData = await apiGet<User>("/users/me/");
      setUser(userData);
    } catch {
      setUser(null);
    }
  };

  const refreshUnreadStatus = async () => {
    window.dispatchEvent(new CustomEvent('refreshUnreadStatus'));
  };

  const isAdmin = (): boolean => {
    return user ? Boolean(user.is_staff || user.is_superuser) : false;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, refreshUser: fetchUser, refreshUnreadStatus, isAdmin }}>
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